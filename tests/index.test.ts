import { expect, test } from "vite-plus/test";
import { VERSION } from "../src/index.ts";

test("exports a version", () => {
  expect(VERSION).toBe("0.0.0");
});
