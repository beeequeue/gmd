import type { Buffer } from "node:buffer"

import type { LanguageEnum, LanguageType } from "./constants"

export type GMDHeader = {
  magic: "GMD"
  version: 0x00010201 | 0x00010302
  language: LanguageEnum
  unknownData: Buffer
  metadataCount: number
  textCount: number
  metadataSize: number
  textSize: number
  filenameSize: number
}

export type GMD = {
  version: 0x00010201 | 0x00010302
  language: LanguageType
  filename: string
  unknownData: Buffer
  metadata: unknown[]
  texts: string[]
}
