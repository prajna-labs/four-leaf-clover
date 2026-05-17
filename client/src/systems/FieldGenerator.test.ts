import { describe, it, expect } from "vitest";
import { generateField } from "./FieldGenerator";

describe("generateField", () => {
  it("returns exactly `count` clovers", () => {
    const clovers = generateField({ width: 800, height: 600, count: 50, seed: 1 });
    expect(clovers).toHaveLength(50);
  });

  it("guarantees exactly one 4-leaf clover", () => {
    const clovers = generateField({ width: 800, height: 600, count: 50, seed: 1 });
    const fourLeafCount = clovers.filter((c) => c.params.leaves === 4).length;
    expect(fourLeafCount).toBe(1);
  });

  it("places all clovers within bounds", () => {
    const width = 800;
    const height = 600;
    const clovers = generateField({ width, height, count: 50, seed: 1 });
    for (const c of clovers) {
      expect(c.x).toBeGreaterThanOrEqual(0);
      expect(c.x).toBeLessThanOrEqual(width);
      expect(c.y).toBeGreaterThanOrEqual(0);
      expect(c.y).toBeLessThanOrEqual(height);
    }
  });

  it("spreads clovers across the field (not all at one point)", () => {
    const clovers = generateField({ width: 800, height: 600, count: 50, seed: 1 });
    const uniqueXs = new Set(clovers.map((c) => c.x));
    const uniqueYs = new Set(clovers.map((c) => c.y));
    expect(uniqueXs.size).toBeGreaterThan(10);
    expect(uniqueYs.size).toBeGreaterThan(10);
  });

  it("varies hue, scale, and rotation per clover", () => {
    const clovers = generateField({ width: 800, height: 600, count: 50, seed: 1 });
    const uniqueHues = new Set(clovers.map((c) => c.params.hue));
    const uniqueScales = new Set(clovers.map((c) => c.params.scale));
    const uniqueRotations = new Set(clovers.map((c) => c.params.rotation));
    expect(uniqueHues.size).toBeGreaterThan(10);
    expect(uniqueScales.size).toBeGreaterThan(10);
    expect(uniqueRotations.size).toBeGreaterThan(10);
  });

  it("places the 4-leaf at different indices for different seeds", () => {
    const indices = new Set<number>();
    for (let seed = 1; seed <= 20; seed++) {
      const clovers = generateField({ width: 800, height: 600, count: 50, seed });
      indices.add(clovers.findIndex((c) => c.params.leaves === 4));
    }
    expect(indices.size).toBeGreaterThan(5);
  });

  it("returns an empty array when count is 0", () => {
    const clovers = generateField({ width: 800, height: 600, count: 0, seed: 1 });
    expect(clovers).toEqual([]);
  });

  it("returns a single 4-leaf clover when count is 1", () => {
    const clovers = generateField({ width: 800, height: 600, count: 1, seed: 1 });
    expect(clovers).toHaveLength(1);
    expect(clovers[0].params.leaves).toBe(4);
  });

  it("produces identical output for the same seed (reproducibility)", () => {
    const a = generateField({ width: 800, height: 600, count: 50, seed: 42 });
    const b = generateField({ width: 800, height: 600, count: 50, seed: 42 });
    expect(a).toEqual(b);
  });
});
