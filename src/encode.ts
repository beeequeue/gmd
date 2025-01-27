import { Buffer } from "node:buffer"

import { Encoder } from "binary-util"

import { Language } from "./constants"
import type { GMD, GMDEntry } from "./types"

export const encodeGmd = (input: GMD) => {
  if (input.version !== 0x00010302) {
    throw new Error(`Unsupported version 0x${input.version.toString(16)}`)
  }

  const hasMetadata = input.entries.some(({ key }) => key != null)

  let metadataBuffer = Buffer.alloc(0)
  let metadataCount = 0
  let metadataEntries = [] as (GMDEntry & { index: number })[]
  if (hasMetadata) {
    metadataEntries = input.entries
      .map((entry, index) => ({ ...entry, index }))
      .filter(({ key }) => key != null)
    metadataCount = metadataEntries.length

    const mdEncoder = new Encoder(metadataEntries.length * 0x14)
    let currentOffset = 0
    for (const metadata of metadataEntries) {
      mdEncoder.setInt32(metadata.index)
      mdEncoder.setUint32(metadata.hash1!)
      mdEncoder.setUint32(metadata.hash2!)
      mdEncoder.setInt32(currentOffset)
      mdEncoder.setInt32(metadata.unknown!)

      currentOffset += Buffer.from(metadata.key!).length + 1
    }

    // TODO: bucket data
    mdEncoder.setBuffer(Buffer.alloc(4 * 0x100))

    metadataBuffer = mdEncoder.buffer
  }

  let keysBuffer = Buffer.alloc(0)
  if (hasMetadata) {
    const keySize = metadataEntries.reduce(
      (acc, { key }) => acc + Buffer.from(key!).length + 1,
      0,
    )

    const keyEncoder = new Encoder(keySize)
    for (const { key } of metadataEntries) {
      keyEncoder.setString(key!)
    }

    keysBuffer = keyEncoder.buffer
  }

  const textLength = input.entries.reduce(
    (acc, { text }) => acc + Buffer.from(text).length + 1,
    0,
  )
  const textEncoder = new Encoder(textLength)
  for (const { text } of input.entries) {
    textEncoder.setString(text)
  }
  const textBuffer = textEncoder.buffer
  if (textBuffer.length !== textLength) {
    throw new Error(`Unexpected text length: ${textBuffer.length} !== ${textLength}`)
  }

  const headerEncoder = new Encoder()

  headerEncoder.setString("GMD") // magic
  headerEncoder.setUint32(input.version) // version
  headerEncoder.setUint32(Language[input.language]) // language
  headerEncoder.setBuffer(input.unknownData) // unknown (flags??)
  headerEncoder.setUint32(metadataCount) // metadata count
  headerEncoder.setUint32(input.entries.length) // text count
  headerEncoder.setUint32(keysBuffer.length) // keys size
  headerEncoder.setUint32(textBuffer.length) // text size
  headerEncoder.setUint32(input.filename.length) // filename size

  headerEncoder.setString(input.filename) // filename

  return Buffer.concat([headerEncoder.buffer, metadataBuffer, keysBuffer, textBuffer])
}
