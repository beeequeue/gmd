import { Buffer } from "node:buffer"
import { crc32 } from "node:zlib"

import { Encoder } from "binary-util"

import { Language } from "./constants.ts"
import type { GMD, GMDEntry } from "./types.ts"

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

    const buckets = new Map<number, number>()
    let bucketCounter = 0
    const mdEncoder = new Encoder(metadataEntries.length * 0x14)
    let currentKeyOffset = 0
    for (const metadata of metadataEntries) {
      let listLink = 0
      const bucket = ~crc32(metadata.key!) & 0xff
      if (buckets.has(bucket)) {
        listLink = bucketCounter
        buckets.set(bucket, bucketCounter)
      }

      mdEncoder.setInt32(metadata.index)
      mdEncoder.setInt32(~crc32(metadata.key! + metadata.key!))
      mdEncoder.setInt32(~crc32(metadata.key! + metadata.key! + metadata.key!))
      mdEncoder.setInt32(currentKeyOffset)
      mdEncoder.setInt32(listLink)

      currentKeyOffset += Buffer.from(metadata.key!).length + 1

      bucketCounter++
    }

    const bucketBuffer = Buffer.alloc(4 * 0x100)
    let counter2 = 0
    for (let i = 0; i < input.entries.length; i++) {
      const entry = input.entries[i]
      if (entry.key == null) continue

      const bucketIndex = ~crc32(entry.key) & 0xff
      if (bucketBuffer[bucketIndex] !== 0) continue

      bucketBuffer.writeInt32LE(counter2 !== 0 ? counter2 : -1, bucketIndex * 4)
      counter2++
    }

    metadataBuffer = Buffer.concat([mdEncoder.buffer, bucketBuffer])
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

  // TODO: benchmark push instead of concat for perf
  return Buffer.concat([headerEncoder.buffer, metadataBuffer, keysBuffer, textBuffer])
}
