import type { Buffer } from "node:buffer"

import { Decoder } from "binary-util"

import { LanguageR } from "./constants.ts"
import type { GMD, GMDEntry, GMDHeader, GMDMetadataHeader } from "./types.ts"

const parseHeader = (parser: Decoder): GMDHeader => ({
  magic: parser.readString({ zeroed: true }) as "GMD",
  version: parser.readUint32() as GMDHeader["version"],
  language: parser.readUint32() as GMDHeader["language"],
  unknownData: parser.readBuffer({ length: 8 }),
  metadataCount: parser.readUint32(),
  textCount: parser.readUint32(),
  keyBlockSize: parser.readUint32(),
  textBlockSize: parser.readUint32(),
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
    header.keyBlockSize +
    header.textBlockSize
  const isMobileFormat = expectedSize !== data.byteLength
  if (isMobileFormat) {
    throw new Error("Mobile format not implemented.")
  }

  // Parse metadata
  const metadataHeaders = [] as GMDMetadataHeader[]
  for (let i = 0; i < header.metadataCount; i++) {
    metadataHeaders.push({
      textIndex: parser.readInt32(),
      hash1: parser.readInt32(),
      hash2: parser.readInt32(),
      offset: parser.readInt32(),
      bucketSomething: parser.readInt32(),
    })
  }

  // Bucket list
  let bucketData: Buffer | undefined
  if (header.metadataCount > 0) {
    bucketData = parser.readBuffer({ length: 0x100 * 4 })
  }

  // TODO: handle encrypted text

  const entries = [] as GMDEntry[]

  const metadataBuffer = parser.readBuffer({ length: header.keyBlockSize })
  const metadataParser = new Decoder(metadataBuffer)
  for (let i = 0; i < metadataHeaders.length; i++) {
    const metadataHeader = metadataHeaders[i]

    const previous = metadataParser.goto(metadataHeader.offset)
    const text = metadataParser.readString({ zeroed: true })
    metadataParser.goto(previous)

    entries[metadataHeader.textIndex] = {
      key: text,
      hash1: metadataHeader.hash1,
      hash2: metadataHeader.hash2,
      bucketSomething: metadataHeader.bucketSomething,
      text: null!,
    }
  }

  const textBuffer = parser.readBuffer({ length: header.textBlockSize })
  const textParser = new Decoder(textBuffer)
  for (let i = 0; i < header.textCount; i++) {
    const text = textParser.readString({ zeroed: true })

    if (entries[i] != null) {
      entries[i].text = text
    } else {
      entries[i] = { text }
    }
  }

  const gmd: GMD = {
    version: header.version,
    language: LanguageR[header.language],
    filename,
    unknownData: header.unknownData,
    entries,
  }
  if (bucketData != null) {
    gmd.bucketData = bucketData
  }

  return gmd
}
