import { Buffer } from "node:buffer"

import colors from "tinyrainbow"

import type { GMD } from "../types.js"

const indent = (str: string, spaces: number): string => {
  const lines = str.split("\n")
  if (lines.length <= 1) return str

  const space = " ".repeat(spaces)
  return lines.map((line, index) => (index !== 0 ? `${space}${line}` : line)).join("\n")
}

export const logError = <Exit extends boolean>(
  error: Error | string,
  exit?: Exit,
): Exit extends true ? never : void => {
  const message = error instanceof Error ? error.message : error
  console.error(colors.red(`❌ ${indent(message, 3)}`))

  if (exit) {
    process.exit(1)
  }

  return undefined as never
}

export const toJson = (input: GMD): string => {
  const data = {
    filename: input.filename,
    version: input.version,
    language: input.language,
    unknownData: input.unknownData.toString("base64url"),
    entries: input.entries,
  } satisfies Omit<GMD, "unknownData"> & { unknownData: string }

  return JSON.stringify(data, null, 2)
}

export const fromJson = (input: string): GMD => {
  const data = JSON.parse(input) as Omit<GMD, "unknownData"> & { unknownData: string }

  return {
    filename: data.filename,
    version: data.version,
    language: data.language,
    unknownData: Buffer.from(data.unknownData, "base64url"),
    entries: data.entries,
  }
}
