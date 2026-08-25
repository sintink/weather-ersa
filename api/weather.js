export default async function handler(req, res) {
  const { lat, lon, city, ai } = req.query;
  const cityName = city || 'Jakarta';

  let weatherData = {};
  try {
    const resWeather = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,cloud_cover,is_day`);
    weatherData = await resWeather.json();
  } catch (e) {
    return res.status(500).json({ error: 'Gagal fetch cuaca' });
  }

  const current = weatherData.current || {};
  const temp = current.temperature_2m || 0;
  const hum = current.relative_humidity_2m || 0;
  const code = current.weather_code || 0;
  const cloud = current.cloud_cover || 0;
  const isDay = current.is_day !== undefined ? current.is_day : 1;

  let displayText = `${cityName} [Cuaca] Suhu: ${temp}°C | Kelembaban: ${hum}%`;
  let audioText = `Cuaca saat ini suhu ${temp} derajat, kelembaban ${hum} persen.`;

  if (ai === '1') {
    const groqApiKey = process.env.GROQ_API_KEY;
    const groqModel = process.env.GROQ_MODEL || 'qwen-2.5-32b';

    if (groqApiKey) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: groqModel,
            response_format: { type: "json_object" },
            messages: [
              {
                role: 'system',
                content: 'Anda adalah asisten cuaca ramah. WAJIB output JSON STRICT format: {"display_text": "teks untuk layar (format: Kota [Kondisi] Suhu: X°C | Tips: Y)", "audio_text": "teks sapaan natural singkat untuk dibacakan TTS (maks 1 kalimat)"}'
              },
              {
                role: 'user',
                content: `Kota: ${cityName}, Kode Cuaca: ${code}, Suhu: ${temp}°C, Kelembaban: ${hum}%, Awan: ${cloud}%, Siang/Malam: ${isDay === 1 ? 'Siang' : 'Malam'}`
              }
            ]
          })
        });

        const groqData = await groqRes.json();
        const contentStr = groqData.choices?.[0]?.message?.content;

        if (contentStr) {
          const aiJson = JSON.parse(contentStr);
          if (aiJson.display_text) displayText = aiJson.display_text;
          if (aiJson.audio_text) audioText = aiJson.audio_text;
        }
      } catch (e) {
        console.error('[Vercel] Groq API Error:', e);
      }
    }
  }

  return res.status(200).json({
    temp,
    hum,
    code,
    cloud,
    is_day: isDay,
    display_text: displayText,
    audio_text: audioText
  });
}
