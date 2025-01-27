import type { Buffer } from "node:buffer"

import { Decoder } from "binary-util"

import { LanguageR } from "./constants"
import type { GMD, GMDHeader } from "./types"

const parseHeader = (parser: Decoder): GMDHeader => ({
  magic: parser.readString({ zeroed: true }) as "GMD",
  version: parser.readUint32() as GMDHeader["version"],
  language: parser.readUint32() as GMDHeader["language"],
  unknownData: parser.readBuffer({ length: 8 }),
  metadataCount: parser.readUint32(),
  textCount: parser.readUint32(),
  metadataSize: parser.readUint32(),
  textSize: parser.readUint32(),
  filenameSize: parser.readUint32(),
})

export const decodeGmd = (data: Buffer): GMD => {
  const parser = new Decoder(data)
  const header = parseHeader(parser)

  if (header.magic !== "GMD") {
    throw new Error(`Invalid magic: ${header.magic as string}`)
  }
  if (header.version !== 0x00010302) {
    throw new Error(`Unknown version: 0x${header.version.toString(16)}`)
  }

  const filename = parser.readString({ length: header.filenameSize + 1 }).slice(0, -1)

  const expectedSize =
    0x28 +
    filename.length +
    1 +
    header.metadataCount * 0x14 +
    (header.metadataCount > 0 ? 0x100 * 0x4 : 0) +
    header.metadataSize +
    header.textSize
  if (expectedSize !== data.byteLength) {
    throw new Error(`Unexpected size: ${data.length} !== ${expectedSize}`)
  }

  if (header.metadataCount !== 0) {
    console.warn(`File contains metadata, which is not supported.`)
  }
  // Parse metadata
  const metadataStart = parser.currentOffset
  for (let i = 0; i < header.metadataCount; i++) {}

  if (metadataStart + header.metadataSize !== parser.currentOffset) {
    throw new Error(
      `Unexpected label size: ${header.metadataSize} !== ${parser.currentOffset - metadataStart}`,
    )
  }

  const texts = [] as string[]

  for (let i = 0; i < header.textCount; i++) {
    texts.push(parser.readString({ zeroed: true }))
  }

  return {
    version: header.version,
    language: LanguageR[header.language],
    filename,
    unknownData: header.unknownData,
    metadata: [],
    texts,
  }
}
