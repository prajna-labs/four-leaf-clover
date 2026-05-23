import { describe, it, expect, vi } from "vitest";

vi.mock("phaser", () => {
  const Container = class {};
  const Scene = class {};
  return {
    default: {
      GameObjects: { Container },
      Scene,
      Geom: { Circle: { Contains: () => {} } },
    },
  };
});

import { computeCloverCount } from "./FieldScene";

describe("computeCloverCount", () => {
  it("기준 모바일 해상도(375×812)에서 60을 반환한다", () => {
    expect(computeCloverCount(375, 812)).toBe(60);
  });

  it("아주 작은 화면에서 MIN(40) 이하로 내려가지 않는다", () => {
    expect(computeCloverCount(200, 300)).toBe(40);
  });

  it("큰 화면에서 MAX(120)을 초과하지 않는다", () => {
    expect(computeCloverCount(1920, 1080)).toBe(120);
  });

  it("기준보다 큰 모바일 화면에서 비례해서 증가한다", () => {
    expect(computeCloverCount(430, 932)).toBe(78);
  });
});
