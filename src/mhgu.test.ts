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

it.skipIf(!existsSync(realFilePath))(
  "should decode, encode, re-decode a real file",
  async () => {
    const file = await fs.readFile(realFilePath)
    const data = decodeGmd(file)

    expect(data.texts[0]).toBe("(None)")
    expect(data.texts[6]).toBe("Petrified Blade")

    const binary = encodeGmd(data)

    expect(binary).toStrictEqual(file)

    const reparsed = decodeGmd(binary)
    expect(reparsed).toStrictEqual(data)
  },
)
