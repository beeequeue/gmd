import type { Buffer } from "node:buffer"

import type { LanguageEnum, LanguageType } from "./constants"

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

export type GMDEntry = {
  key?: string
  hash1?: number
  hash2?: number
  unknown?: number
  text: string
}

export type GMD = {
  version: 0x00010201 | 0x00010302
  language: LanguageType
  filename: string
  unknownData: Buffer
  entries: GMDEntry[]
}
