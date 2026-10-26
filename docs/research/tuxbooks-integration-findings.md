# TuxBooks integration findings (2026-10-26)

This corrects and supersedes the MuPDF-centric assumptions in
`deep-research-report.md`. That report was written before the library was
submodule'd into TuxBooks; its algorithmic survey (cylinder vs cone vs mesh,
input handling, realism) still stands, but its **texture pipeline and engine
details are wrong for this consumer**. Read this file first.

## The engine is PDFium, not MuPDF

The original report assumes MuPDF.js throughout ("MuPDF renders page to a
hidden canvas → texture"). TuxBooks does not use MuPDF. It uses
`@embedpdf/pdfium` (2.15.1, MIT) compiled to WASM and driven in a Web Worker.

The render seam that already exists, at
`frontend/src/lib/pdf/pdfiumWorker.ts:122-145`:

```ts
render({ page, width, height, clip, colorScheme }): Promise<{
  width: number;
  height: number;
  bitmap: ImageBitmap;
}>
```

The worker renders RGBA (`engine.renderRgba`), wraps it in `ImageData`, calls
`createImageBitmap(imageData)`, and returns the `ImageBitmap` to the main
thread. `gl.texImage2D` accepts an `ImageBitmap` directly, so the library's
`loadPageTexture(pageIndex, source)` needs no intermediate `<canvas>` or
`<img>` hop. The original report's "render into a hidden canvas, then upload"
step is dead weight — delete it.

Two PDFium-side facts the library must respect:

- **Size capping.** `clampBitmapSize(width, height)` caps oversized bitmaps to
  the WASM heap budget (a 2**25 byte ceiling). The engine returns the size it
  actually rendered (`capped.width/height`), which can be smaller than
  requested at deep zoom. The library must key textures on the returned
  dimensions, never on the requested ones.
- **Color scheme.** The render call takes a `colorScheme` (Smart-Dark / tint /
  theme treatment). A cached texture is only valid for the scheme it was
  rendered under, so the texture cache key must include the scheme — the same
  invalidation the reader already does on color-mode change
  (`PdfReader.tsx:892-902`).

## ImageBitmap upload: fine, but budget for jank

The intended path (worker → `ImageBitmap` → `texImage2D`) is the one
`ImageBitmap` was designed for; browsers *may* blit it to the GPU without a
CPU round-trip. But it is not free and not guaranteed jank-free (see the
WebGLFundamentals Q&A, scraped 2026-10-26):

- `createImageBitmap` inside a worker can spawn Chrome's own internal
  ThreadPool workers, adding threads and contention. TuxBooks already calls it
  in the worker; that is acceptable but is not free.
- `texImage2D` of a large image is a render-process → GPU-process copy
  (~4 MB for 1024×1024 RGBA). Uploading several full pages in one frame will
  hitch.
- Mitigations, in order of preference for this library: (1) upload at most one
  texture per frame during a flip, (2) cap texture resolution to display size ×
  DPR, not to PDF native size, (3) defer the next-page upload to the frame
  *after* the current flip starts.

The performance budget from the original report carries over unchanged:
≥30 FPS floor, ~60 FPS target, GPU time <5 ms/frame.

## Curl math: use the fragment-shader formulation, not the vertex mesh

The original report recommends a ~32–40² vertex mesh deformed in the vertex
shader, derived from the PARC cone-model paper. That derivation is correct but
opaque. The Page Curl Shader Breakdown (Andrew Hung, 2018; scraped 2026-10-26)
gives a **fragment-shader** formulation that is simpler, needs **no mesh
tesselation at all** (a single quad), and reduces to pure trigonometry:

- Model the curl as a **cylinder** whose edges are parallel to a "curl axis" —
  the crease line. Pass both page textures (current + next) to the fragment
  shader.
- Per fragment, compute the distance `d` from the fragment to the curl axis.
  `d` alone decides which texture to sample and which UV to use — the cylinder
  angle and rotation never need solving explicitly.
- Orientation of the curl axis comes from the drag vector:
  `dir = normalize(clickPos - dragPos)`, with the axis perpendicular to `dir`
  through `dragPos`. For keyboard-driven flips (no drag), animate `dragPos`
  across the page over time instead.

This drops `meshResolution` from the `PageFlipSettings` API entirely and
removes the vertex-deformation path. Keep the PARC/cylinder notes in the
original report as background, but implement against the fragment-shader
form. A working reference lives at
`https://www.shadertoy.com/view/ls3cDB`, and Chrome ships a first-party
deformable-page demo at
`https://chrome.dev/html-in-canvas/demos/webgl-deformable-page.html`.

Consequence for the API: the turning page needs **two** textures at once
(front = current page, back = next page), which the original report's
`loadPageTexture(pageIndex, source)` already implies but never states. The
shader needs both bound simultaneously, so the texture cache must guarantee
the current and next page are resident before a flip starts (this is the
preload concern #226 raised under "Reading order during a turn").

## raw WebGL2 over three.js

For a single textured quad with a custom fragment shader, three.js buys almost
nothing and costs bundle weight plus a supply-chain review. The original report
listed three.js as "recommended" but never sized the alternative. Decision:
**raw WebGL2**, no 3D-library dependency. This keeps the library at zero
runtime dependencies (it is MIT, submodule'd into a GPL app, and the fewer
deps the lighter the SBOM and audit surface per `docs/SUPPLY_CHAIN.md`).

## Context loss is real in Electron

Register `webglcontextlost` (call `preventDefault()` so the browser permits a
restore) and `webglcontextrestored`. On restore, re-create the GL program and
re-upload textures from the cache. Electron's GPU process can be restarted
independently of the renderer, so this is not a theoretical path.

## Reduced motion

`prefers-reduced-motion` must collapse the flip to an instant page swap. The
app has **no** app-level reduced-motion handling today (only the marketing
site's CSS). The library should accept a `reducedMotion: boolean` or an
`AnimationDriver` so the host decides; the host reads `matchMedia` and the
library must not read it directly (it would be wrong in tests and in the
examples playground).

## What still needs research before v1

- Fragment-shader curl correctness across aspect ratios (portrait vs landscape
  PDFs) and page-size mismatches within one spread.
- Whether to render the page **back** face as a real texture or as a solid
  paper color (bleed-through is out of scope for v1).
- UV sampling quality at the curl crease (mip-mapping vs a seam artifact).
- Pointer-capture and drag-to-flip interaction mapping onto the fragment-shader
  `dragPos`, since tuxbooks wants click zones rather than free drag in v1.
