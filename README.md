# Chris Grauberger — Project portfolio

A static GitHub Pages portfolio with a horizontally scrollable 3D project gallery and synchronized project details. Five illustrative projects are explicitly marked as placeholders; they do not claim completed work or results.

## Publish

In **Settings → Pages**, select **Deploy from a branch**, then **main** and **/ (root)**, and save. The site will publish at https://chrisg20.github.io/portfolio/. No build service, backend, or API keys are needed. All paths are relative for the `/portfolio/` project URL.

## Replace projects

Edit `projects.js`. Each entry holds its title, category, summary, tags, notes, accent color, and model path. Put a self-contained, uncompressed `.glb` file in `models/`, then change `model: null` to `model: './models/your-project.glb'`. Models are automatically centered and scaled. Keep models reasonably small for mobile devices. Export STEP/STL/CAD to GLB using your preferred CAD or 3D tool first; this site loads GLB/glTF, not native CAD formats. Compressed Draco/KTX assets require additional decoder configuration, which is not included.

When replacing the sample entries, also update the placeholder labels in `index.html` and `app.js`. To add or remove a project, add or remove an entry in `projects.js`; navigation and counting adapt automatically.

## Local preview

Run `python3 -m http.server 8000` in the repository and open http://localhost:8000. ES modules require an HTTP server; opening `index.html` directly from disk will not work.

## Interaction and accessibility

- Swipe or horizontally scroll through models; select a card to update the details below.
- Previous/next buttons select and reveal adjacent projects.
- With the gallery focused, use Left/Right, Home, or End to select a project.
- The rotation control pauses all models; reduced-motion preferences disable automatic rotation initially.
- If WebGL fails, project selection and text still work.
- Offscreen models and hidden browser tabs avoid rendering work. Pixel ratio and animation rate are capped for mobile devices.

## Dependencies

Three.js and its GLTFLoader are vendored in `vendor/` with their MIT license. There are no external fonts, trackers, CDNs, or network services required to run the site.
