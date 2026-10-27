# pagecurl-gl

A MIT-licensed React library for realistic **page-curl page turns**, rendered
with WebGL2 fragment-shader deformation (no vertex mesh, no 3D-library
dependency). Built for TuxBooks, which feeds it PDF page bitmaps as
`ImageBitmap` textures from PDFium.

Pages are deformed on the GPU with a cylindrical curl model, targeting 60 FPS
with low CPU load. `docs/research/tuxbooks-integration-findings.md` records the
engine, texture, and shader decisions that TuxBooks' integration requires;
`docs/research/deep-research-report.md` is the original survey it corrects.

## Status

Early scaffold. Planned features (per the research docs):

- WebGL2 fragment-shader cylinder deformation
- Drag/touch corner-grab with momentum-based release
- On-demand texture loading with LRU eviction (PDFium `ImageBitmap` integration)
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
