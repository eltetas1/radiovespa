
# Datos editables desde Google Sheets o JSON externo

La web carga los datos en este orden:
1) Si añades `?data=URL` al final de la web, usa esa URL.
2) Si defines la variable de entorno `VITE_VESPAS_URL` en Netlify, usa esa URL.
3) Si nada de lo anterior, usa `src/data/vespas.json` (incluido).

## Google Sheets (CSV público)
- Cabeceras EXACTAS: id, nombre, telefono, servicios, tamano, zonas, horario, notas, visible, prioridad, trabajosVerificados, etiquetas, destacado
- Para listas (servicios, zonas, etiquetas) separa con `;`
- Publica la hoja: Archivo → Publicar en la web → CSV → copiar URL.
- En Netlify: Site settings → Build & deploy → Environment → Add variable:
  - Key: VITE_VESPAS_URL
  - Value: (tu URL CSV)
- Vuelve a desplegar (Trigger deploy → Clear cache and deploy site).

## JSON externo
- Mismo formato que `src/data/vespas.json`.
- Pon la URL en `VITE_VESPAS_URL` o en la query `?data=URL` para pruebas.
