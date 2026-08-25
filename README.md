# Ersa Weather API

API Gateway serverless (Vercel) untuk mengambil data cuaca dari Open-Meteo,
dipakai oleh perangkat ESP32 Central Ersa (Board B).

## Endpoint

`GET /api/weather?lat=<latitude>&lon=<longitude>&city=<nama_kota>&ai=<0|1>`

- `lat`, `lon` — koordinat lokasi
- `city` — nama kota (opsional, default "Jakarta")
- `ai` — `1` untuk mengaktifkan tips cuaca dari AI (Groq), `0` untuk tips statis

## Environment Variables

- `GROQ_API_KEY` — API key Groq (opsional, hanya dipakai saat `ai=1`)
- `GROQ_MODEL` — model Groq yang dipakai (default: `qwen-2.5-32b`)

## Response

```json
{
  "temp": 30,
  "hum": 70,
  "code": 1,
  "cloud": 40,
  "is_day": 1,
  "display_text": "Jakarta [Cuaca] Suhu: 30°C | Kelembaban: 70%",
  "audio_text": "Cuaca saat ini suhu 30 derajat, kelembaban 70 persen."
}