import type { Buffer } from "node:buffer"

import type { LanguageEnum, LanguageType } from "./constants"

export type GMDHeader = {
  magic: "GMD"
  version: 0x00010201 | 0x00010302
  language: LanguageEnum
  unknownData: Buffer
  labelCount: number
  sectionCount: number
  labelSize: number
  sectionSize: number
  filenameSize: number
}

export type GMD = {
  version: 0x00010201 | 0x00010302
  language: LanguageType
  filename: string
  unknownData: Buffer
  labels: unknown[]
  texts: string[]
}
