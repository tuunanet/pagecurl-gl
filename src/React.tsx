import { useRef } from "react";
import type { PageFlipSettings } from "./types.ts";

export interface PageFlipProps extends PageFlipSettings {}

/**
 * React wrapper around the (planned) headless page-flip controller.
 *
 * Renders the container that will host the WebGL canvas. The curl renderer
 * is not wired up yet — see docs/research/deep-research-report.md for the design.
 */
export function PageFlip({ width, height }: PageFlipProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return <div ref={containerRef} data-pageflip-container style={{ width, height }} />;
}
