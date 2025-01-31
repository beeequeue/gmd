import { describe, expect, it } from "vitest"

import { findCommonPathStart, getOutputPath } from "./path-utils.ts"

describe("findCommonPathStart", () => {
  const cases = [
    [["a/b/c/d/e.1", "a/b/c/d/f.1", "a/b/c.1"], 4],
    [["a/b/c/d/e.1", "a/b/c/d/f.1", "a/d/c.1"], 2],
    [["a/b/c/d/e.1", "a/b/c/d/f.1", "a/b/c/d.1"], 6],
    [["C:/foo/bar/biz.1", "C:/foo/bar/baz.1", "C:/foo/bar/biz.2"], 11],
    [["X:/foo/bar/biz.1", "X:/foo/bar/baz.1", "X:/foo/baz/biz.2"], 7],
  ] satisfies Array<[input: string[], expectedIndex: number]>

  it.each(cases)("should find the common directory %#", (input, expected) => {
    expect(findCommonPathStart(input)).toEqual(expected)
  })
})

describe("getOutputPath", () => {
  const noOutDirCases = [
    ["./foo/bar/baz.gmd", "./foo/bar/baz.gmd.json"],
    ["./foo/bar/baz.gmd.json", "./foo/bar/baz.gmd"],
    ["bar/baz.gmd", "bar/baz.gmd.json"],
    ["T:/foo/bar/baz.gmd", "T:/foo/bar/baz.gmd.json"],
  ] satisfies Array<[inputFilePath: string, expected: string]>

  it.each(noOutDirCases)(
    "should return next to the input with no output directory specified %#",
    (input, expected) => {
      expect(getOutputPath(input)).toEqual(expected)
    },
  )
  const withOutDirCases = [
    ["T:/a/b/c/d/e/f/file.gmd", "./out/c/d/e/f/file.gmd.json"],
    ["T:/a/b/c/d/e/f/file.gmd.json", "./out/c/d/e/f/file.gmd"],
    ["T:/a/b/c/d/file.gmd", "./out/c/d/file.gmd.json"],
    ["T:/a/b/c/file.gmd", "./out/c/file.gmd.json"],
    ["T:/a/b/c/d/e/f/file.gmd", "./out/c/d/e/f/file.gmd.json"],
  ] satisfies Array<[inputFilePath: string, expected: string]>

  it.each(withOutDirCases)(
    "should return correct path with output directory specified %#",
    (input, expected) => {
      expect(getOutputPath(input, 7, "./out")).toEqual(expected)
    },
  )
})
