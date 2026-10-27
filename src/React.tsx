import { useRef } from "react";
import type { PageCurlSettings } from "./types.ts";

export interface PageCurlProps extends PageCurlSettings {}

/**
 * React wrapper around the (planned) headless page-curl controller.
 *
 * Renders the container that will host the WebGL canvas. The curl renderer
 * is not wired up yet — see docs/research/tuxbooks-integration-findings.md for
 * the design.
 */
export function PageCurl({ width, height }: PageCurlProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return <div ref={containerRef} data-pagecurl-container style={{ width, height }} />;
}
