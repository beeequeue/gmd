import type { Buffer } from "node:buffer"

import { Decoder } from "binary-util"

import { LanguageR } from "./constants"
import type { GMD, GMDHeader } from "./types"

const parseHeader = (parser: Decoder): GMDHeader => ({
  magic: parser.readString({ zeroed: true }) as "GMD",
  version: parser.readUint32() as GMDHeader["version"],
  language: parser.readUint32() as GMDHeader["language"],
  unknownData: parser.readBuffer({ length: 8 }),
  labelCount: parser.readUint32(),
  sectionCount: parser.readUint32(),
  labelSize: parser.readUint32(),
  sectionSize: parser.readUint32(),
  filenameSize: parser.readUint32(),
})

export const decodeGmd = (data: Buffer): GMD => {
  const parser = new Decoder(data)
  const header = parseHeader(parser)

  if (header.magic !== "GMD") {
    throw new Error(`Invalid magic: ${header.magic as string}`)
  }
  if (header.version !== 0x00010201 && header.version !== 0x00010302) {
    throw new Error(`Unknown version: 0x${(header.version as number).toString(16)}`)
  }

  const filename = parser.readString({ length: header.filenameSize + 1 }).slice(0, -1)

  const expectedSize =
    0x28 +
    filename.length +
    1 +
    header.labelCount * 0x14 +
    (header.labelCount > 0 ? 0x100 * 0x4 : 0) +
    header.labelSize +
    header.sectionSize
  if (expectedSize !== data.byteLength) {
    throw new Error(`Unexpected size: ${data.length} !== ${expectedSize}`)
  }

  if (header.labelCount !== 0) {
    console.warn(`File contains ${header.labelCount} labels, and they are not supported.`)
  }
  // Parse labels
  const labelStart = parser.currentOffset
  for (let i = 0; i < header.labelCount; i++) {}

  if (labelStart + header.labelSize !== parser.currentOffset) {
    throw new Error(
      `Unexpected label size: ${header.labelSize} !== ${parser.currentOffset - labelStart}`,
    )
  }

  const texts = [] as string[]

  for (let i = 0; i < header.sectionCount; i++) {
    texts.push(parser.readString({ zeroed: true }))
  }

  return {
    version: header.version,
    language: LanguageR[header.language],
    filename,
    unknownData: header.unknownData,
    labels: [],
    texts,
  }
}
