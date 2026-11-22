# Deck EPIM — Google Slides API

## Contenido

| Archivo | Rol |
|---------|-----|
| `deck-epim-piloto-spec.json` | Texto y estructura de cada diapositiva (fuente para la API) |
| `propuesta-epim-piloto-manabi-afinada.md` | Narrativa afinada (gerencia, énfasis equilibrado) |
| `scripts/generate-google-slides-deck.mjs` | Generador vía Google Slides API |
| `deck-slide-images.json` + `scripts/generate-deck-images.mjs` | Ilustraciones sin texto (enfoque antiguo; no usar para pitch) |
| `pitch-slides-spec.json` + `scripts/generate-pitch-slide.mjs` | **6 slides de pitch** con texto en español, estilo regente 50/50, colores EPA; una slide por comando; `gemini-nano-banana-2.1` + `GEMINI_API_KEY` |
| `.pitch/epim-pitch-deck-manabi.pdf` | PDF único (6 páginas, JPEG comprimido); regenerar con `scripts/build-pitch-pdf.py` |

**Audiencia:** Gerencia de Gestión de Cuenca y Recaudación (Manabí) + técnicos.  
**Énfasis:** campo · validación · mapa · tablero RUAA–EPA (mismo peso).

## Configuración (una vez)

1. [Google Cloud Console](https://console.cloud.google.com/): crear proyecto → habilitar **Google Slides API** y **Google Drive API**.
2. **Credenciales** → Crear ID de cliente OAuth → Aplicación de escritorio → descargar JSON como `docs/scripts/credentials.json`.
3. En la carpeta de scripts:

```bash
cd docs/scripts
npm install
npm run auth:google
```

4. Revisar diapositivas en seco (sin API):

```bash
node generate-google-slides-deck.mjs --dry-run
```

5. Generar en tu Google Drive:

```bash
npm run generate:slides
```

La URL de edición se imprime en consola.

## Personalizar

Edita `deck-epim-piloto-spec.json` (títulos, bullets, `speakerNotes`). Vuelve a ejecutar el generador; crea una **presentación nueva** cada vez (no actualiza una existente).

## Seguridad

No subas `credentials.json` ni `token.json` al repositorio. Están en `.gitignore` bajo `docs/scripts/`.