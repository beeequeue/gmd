import { Buffer } from "node:buffer"

import { Encoder } from "binary-util"

import { Language } from "./constants"
import type { GMD } from "./types"

export const encodeGmd = (input: GMD) => {
  if (input.version !== 0x00010201 && input.version !== 0x00010302) {
    throw new Error(`Unsupported version 0x${(input.version as number).toString(16)}`)
  }

  const textLength = input.texts.reduce((acc, text) => acc + text.length + 1, 0)
  const textEncoder = new Encoder(textLength)
  for (const text of input.texts) {
    textEncoder.setString(text)
  }
  const textBuffer = textEncoder.buffer
  if (textBuffer.byteLength !== textLength) {
    throw new Error(`Unexpected text length: ${textBuffer.byteLength} !== ${textLength}`)
  }

  const headerEncoder = new Encoder()

  headerEncoder.setString("GMD") // magic
  headerEncoder.setUint32(input.version) // version
  headerEncoder.setUint32(Language[input.language]) // language
  headerEncoder.setBuffer(input.unknownData) // unknown (flags??)
  headerEncoder.setUint32(input.labels.length) // label count
  headerEncoder.setUint32(input.texts.length) // section count
  headerEncoder.setUint32(0) // TODO: label size
  headerEncoder.setUint32(textBuffer.byteLength) // section size
  headerEncoder.setUint32(input.filename.length) // filename size

  headerEncoder.setString(input.filename) // filename

  return Buffer.concat([headerEncoder.buffer, textBuffer])
}
