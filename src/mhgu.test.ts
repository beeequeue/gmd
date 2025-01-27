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

    expect(data.entries[0].text).toBe("(None)")
    expect(data.entries[6].text).toBe("Petrified Blade")

    const binary = encodeGmd(data)

    expect(binary).toStrictEqual(file)

    const reDecoded = decodeGmd(binary)
    expect(reDecoded).toStrictEqual(data)
  },
)

const labelFilePath = path.resolve(import.meta.dirname, "../fixtures/Common_eng.gmd")
it.skipIf(!existsSync(labelFilePath))(
  "should decode, encode, re-decode a file with labels",
  async () => {
    const file = await fs.readFile(labelFilePath)
    const data = decodeGmd(file)

    expect(data.entries[0].text).toBe("Invalid Message")
    expect(data.entries[1].key).toBe("COUNT")
    expect(data.entries[1].text).toBe("%d")
    expect(data.entries[2].key).toBe("INFINITY")
    expect(data.entries[2].text).toBe("∞")

    const binary = encodeGmd(data)
    expect(binary).toStrictEqual(file)

    const reDecoded = decodeGmd(binary)
    expect(reDecoded).toStrictEqual(data)
  },
)
