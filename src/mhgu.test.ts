import { existsSync } from "node:fs"
import fs from "node:fs/promises"
import path from "node:path"

import { expect, it } from "vitest"

import { decodeGmd } from "./decode"
import { encodeGmd } from "./encode"

const realFilePath = path.resolve(
  import.meta.dirname,
  "../fixtures/weapon00MsgData_eng.gmd",
)

it.skipIf(!existsSync(realFilePath))("should parse a real file", async () => {
  const file = await fs.readFile(realFilePath)
  const data = decodeGmd(file)

  expect(data.texts[0]).toBe("(None)")
  expect(data.texts[6]).toBe("Petrified Blade")

  const binary = encodeGmd(data)

  // expect(binary.subarray(0, 250)).toStrictEqual(file.subarray(0, 250))

  const reparsed = decodeGmd(binary)
  expect(reparsed).toStrictEqual(data)
})
