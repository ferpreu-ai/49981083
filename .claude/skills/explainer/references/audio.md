# Sincronía con una voz grabada

Con la voz ya grabada, el motor deja de estimar. Cada palabra usa su segundo real y el audio manda el reloj.

## 1. Preparar el audio

Cortá el tramo de la voz. El segundo 0 del audio es el segundo 0 del explainer.

```bash
ffmpeg -i grabacion.mov -ss 12.4 -to 74.8 -vn -ac 1 -ar 16000 voz.wav
ffmpeg -i voz.wav -b:a 96k voz.mp3
```

Para encontrar el inicio y el fin, buscá los silencios:

```bash
ffmpeg -i grabacion.mov -af silencedetect=noise=-35dB:d=0.4 -f null - 2>&1 | grep silence_
```

## 2. Transcribir con tiempos por palabra

Con whisper.cpp:

```bash
whisper-cli -m RUTA/ggml-large-v3-turbo.bin -l es -f voz.wav -ojf -ml 1 -sow -of voz
```

Con openai-whisper en Python:

```bash
whisper voz.wav --language es --word_timestamps True --output_format json
```

Cambiá `-l es` o `--language es` por el idioma de la voz.

## 3. Pasar las palabras al explainer

```bash
node SKILL_DIR/scripts/palabras.mjs voz.json
```

El script lista cada palabra con su índice y su segundo. Elegí la primera palabra de cada escena. Cortá en el final de una frase.

```bash
node SKILL_DIR/scripts/palabras.mjs voz.json --cortes 0,18,41,63
```

Pegá el `SCRIPT` y el `WORDS` que imprime en la sección 2 de la plantilla.

- `SCRIPT` sale de la transcripción. Así la cantidad de palabras coincide con `WORDS`.
- Corregí errores de transcripción en los dos lugares. No agregues ni quites palabras.
- Si la cantidad no coincide, el simulador avisa y el motor vuelve a los tiempos estimados.

## 4. Incrustar el audio

Para un artifact o un archivo único, incrustalo en base64:

```bash
echo "data:audio/mpeg;base64,$(base64 < voz.mp3 | tr -d '\n')" > voz.txt
```

Pegá el contenido de `voz.txt` en `AUDIO_SRC`. Para un archivo local, alcanza con `AUDIO_SRC = 'voz.mp3'` junto al HTML.

Con audio, el explainer arranca en pausa. El navegador exige un toque antes de sonar.

## 5. Revisar la sincronía

- Corré el simulador. No tiene que haber avisos.
- Sacá fotos en el segundo de cada palabra clave: el evento tiene que estar en ese cuadro.
- `F.at('palabra')` ya usa los segundos reales. No hace falta mover nada a mano.

## 6. Sumar la voz al MP4

El render produce video sin sonido. Sumale la voz:

```bash
ffmpeg -i out/explainer.mp4 -i voz.mp3 -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart out/explainer-con-voz.mp4
```

Para música de fondo, mezclala debajo de la voz y normalizá a −14 LUFS:

```bash
ffmpeg -i out/explainer.mp4 -i voz.mp3 -i musica.mp3 -filter_complex "[2:a]volume=0.15[m];[1:a][m]amix=inputs=2:duration=first,loudnorm=I=-14:TP=-1:LRA=11[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart out/explainer-final.mp4
```
