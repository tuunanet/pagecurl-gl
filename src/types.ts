/**
 * Public types for the pagecurl library.
 *
 * The design follows the recommended API from the research docs (see
 * docs/research/tuxbooks-integration-findings.md, which corrects the original
 * survey in deep-research-report.md): a headless flip controller driven by a
 * WebGL2 fragment-shader page curl, with page bitmaps (e.g. rendered by
 * PDFium) supplied as textures.
 */

export type FlipDirection = "next" | "prev";

export interface PageCurlSettings {
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

export interface PageCurlAPI {
  flipNext(): void;
  flipPrev(): void;
  flipTo(pageIndex: number): void;
  /** Provide a rendered page bitmap (canvas/image) for the given page index. */
  loadPageTexture(pageIndex: number, source: PageTextureSource): void;
  destroy(): void;
}
