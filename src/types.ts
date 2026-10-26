/**
 * Public types for the page-flip library.
 *
 * The design follows the recommended API from the research report
 * (see docs/research/deep-research-report.md): a headless flip controller driven by a
 * WebGL cylindrical page-curl mesh, with page bitmaps (e.g. rendered by
 * MuPDF.js) supplied as textures.
 */

export type FlipDirection = "next" | "prev";

export interface PageFlipSettings {
  /** Base page width in CSS px. */
  width: number;
  /** Base page height in CSS px. */
  height: number;
  /** Include the first/last page as a standalone cover. */
  showCover?: boolean;
  /** Drive the animation with requestAnimationFrame. */
  acceleration?: boolean;
  /** Mesh tesselation per page side (vertex grid is segments x segments). */
  meshResolution?: number;
  onFlipStart?: (prev: number, next: number) => void;
  onFlipEnd?: (newIndex: number) => void;
}

export interface PageTextureSource {
  width: number;
  height: number;
}

export interface PageFlipAPI {
  flipNext(): void;
  flipPrev(): void;
  flipTo(pageIndex: number): void;
  /** Provide a rendered page bitmap (canvas/image) for the given page index. */
  loadPageTexture(pageIndex: number, source: PageTextureSource): void;
  destroy(): void;
}
