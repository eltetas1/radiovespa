# RadioVespa Ceuta — listo para publicar

## Editar datos
- Cambia `src/data/vespas.json` (añade/edita Vespas).

## Desarrollo local
```
npm install
npm run dev
```

## Publicar (Vercel)
1. Crea cuenta en vercel.com e importa este proyecto.
2. Build: `npm run build` (auto). Output: `dist`.

## Publicar (Netlify)
1. Nuevo sitio desde Git o repo.
2. Build command: `npm run build`. Publish dir: `dist`.

## PWA
Incluye manifest e iconos válidos. Si un bloqueador molesta en local, prueba en incógnito o quita temporalmente el `<link rel="manifest" ...>` en `index.html`.
