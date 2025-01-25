import type { LanguageEnum, LanguageType } from "./constants"

export type GMDHeader = {
  magic: "GMD"
  version: 0x00010201 | 0x00010302
  language: LanguageEnum
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
  labels: unknown[]
  texts: string[]
}
