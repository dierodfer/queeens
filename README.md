# queens-game.github.io

Juego de reinas (N x N) en HTML/CSS/JS para GitHub Pages.

## Estructura minima

```text
.
├── .github/workflows/release-version.yml
├── index.html
├── version.json
├── src/
│   ├── assets/
│   │   ├── queen-danger.svg
│   │   └── queen-white.svg
│   ├── boards.js
│   ├── script.js
│   └── styles.css
```

## Version de la aplicacion

- La version visible en la UI se lee de `version.json`.
- `src/script.js` la carga al iniciar y la muestra en pantalla.

## GitHub Action de release

- Workflow: `.github/workflows/release-version.yml`
- Trigger: al publicar una release.
- Accion: toma el tag (`vX.Y.Z` o `X.Y.Z`) y sincroniza `version.json`.