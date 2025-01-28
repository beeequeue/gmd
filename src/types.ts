import type { Buffer } from "node:buffer"

import type { LanguageEnum, LanguageType } from "./constants.ts"

export type GMDHeader = {
  magic: "GMD"
  version: 0x00010201 | 0x00010302
  language: LanguageEnum
  unknownData: Buffer
  metadataCount: number
  textCount: number
  keysSize: number
  textSize: number
  filenameSize: number
}

export type GMDMetadataHeader = {
  textIndex: number
  hash1: number
  hash2: number
  offset: number
  unknown: number
}

export type GMDEntry =
  | {
      text: string
      key?: undefined
      hash1?: undefined
      hash2?: undefined
      unknown?: undefined
    }
  | {
      text: string
      key: string
      hash1: number
      hash2: number
      unknown: number
    }

export type GMD = {
  version: 0x00010201 | 0x00010302
  language: LanguageType
  filename: string
  unknownData: Buffer
  entries: GMDEntry[]
}
