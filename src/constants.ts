export const Language = {
  Ja: 0,
  En: 1,
  Fr: 2,
  Es: 3,
  De: 4,
  It: 5,
} as const

export const LanguageR = ["Ja", "En", "Fr", "Es", "De", "It"] as const

export type LanguageType = keyof typeof Language
export type LanguageEnum = (typeof Language)[keyof typeof Language]
