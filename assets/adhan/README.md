# Adhan recordings

Noor ships without Adhan recordings. Until files are added, the Adhan sound
screen offers only **Device default** and **Silent**; each voice shows
"Audio not added yet".

To add a voice (for example Makkah):

1. Put the files here, named exactly:
   - `adhan_makkah.wav` – notification clip, **30 seconds or less** (iOS plays
     nothing custom beyond 30 s). WAV, 16-bit PCM, 44.1 kHz is safest.
   - `adhan_makkah_fajr.wav` – optional Fajr version ("as-salatu khayrun
     minan-nawm"), same limits.
   - `adhan_makkah_full.mp3` – optional full-length recording, played only as
     the in-app preview.
2. List the notification clips in `app.json` under the `expo-notifications`
   plugin: `"sounds": ["./assets/adhan/adhan_makkah.wav", "./assets/adhan/adhan_makkah_fajr.wav"]`.
3. Register them in `src/features/prayer/adhanAssets.ts`.
4. Make a new development build (`eas build --profile development`); bundled
   sounds can't be added over the air.

Voice ids: `makkah`, `madinah`, `aqsa`, `alafasy`, `takbir`. Make sure you have
the right to distribute each recording.
