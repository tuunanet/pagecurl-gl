# pageflip-wasm

A MIT-licensed React library for realistic **3D page-flip (page-curl) effects**,
designed to pair with WASM PDF renderers such as MuPDF.js.

Pages are rendered to textures on demand and deformed on the GPU using a
cylindrical page-curl mesh (parametric curl model), targeting 60 FPS with
low CPU load. See `docs/research/deep-research-report.md` for the full research and design
rationale.

## Status

Early scaffold. Planned features (per the research report):

- WebGL cylindrical page-curl vertex-shader deformation
- Drag/touch corner-grab with momentum-based release
- On-demand texture loading with LRU eviction (MuPDF.js integration)
- React component + headless core API (`flipNext`, `flipPrev`, `flipTo`)
- Keyboard accessibility and flip lifecycle events

## Development

- Install dependencies:

```bash
vp install
```

- Run the unit tests:

```bash
vp test
```

- Build the library:

```bash
vp pack
```

## License

[MIT](./LICENSE)
