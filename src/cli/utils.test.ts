import { describe, expect, it } from "vitest"

import { findCommonDir } from "./utils.ts"

describe("findCommonDir", () => {
  const cases = [
    [["a/b/c/d/e.1", "a/b/c/d/f.1", "a/b/c.1"], "a/b"],
    [["a/b/c/d/e.1", "a/b/c/d/f.1", "a/d/c.1"], "a"],
    [["C:/foo/bar/biz.1", "C:/foo/bar/baz.1", "C:/foo/bar/biz.2"], "C:/foo/bar"],
    [["X:/foo/bar/biz.1", "X:/foo/bar/baz.1", "X:/foo/baz/biz.2"], "X:/foo"],
  ] satisfies Array<[input: string[], expected: string]>

  it.each(cases)("should find the common directory %#", (input, expected) => {
    const result = findCommonDir(input)
    expect(result).toEqual(expected)
  })
})
