import type { Buffer } from "node:buffer"

import type { LanguageEnum, LanguageType } from "./constants.ts"

export type GMDHeader = {
  magic: "GMD"
  /** MHGU & World uses 0x00010302 */
  version: 0x00010201 | 0x00010302
  /** MHGU always sets this to Ja (0) */
  language: LanguageEnum
  unknownData: Buffer
  metadataCount: number
  textCount: number
  keyBlockSize: number
  textBlockSize: number
  filenameSize: number
}

export type GMDMetadataHeader = {
  /** The index the string in the text block */
  textIndex: number
  hash1: number
  hash2: number
  /** The offset of the string in the text block */
  offset: number
  bucketSomething: number
}

export type GMDEntry =
  | {
      text: string
      key?: undefined
      hash1?: undefined
      hash2?: undefined
      bucketSomething?: undefined
    }
  | {
      text: string
      key: string
      hash1: number
      hash2: number
      bucketSomething: number
    }

export type GMD = {
  version: 0x00010201 | 0x00010302
  language: LanguageType
  filename: string
  unknownData: Buffer
  entries: GMDEntry[]
}
