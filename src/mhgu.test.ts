import { existsSync } from "node:fs"
import fs from "node:fs/promises"
import path from "node:path"

import { fdir } from "fdir"
import { expect, it } from "vitest"

import { decodeGmd } from "./decode.ts"
import { encodeGmd } from "./encode.ts"

const realFilePath = path.resolve(
  import.meta.dirname,
  "../fixtures/mhgu/simple/weapon00MsgData_eng.gmd",
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

const labelFilePath = path.resolve(
  import.meta.dirname,
  "../fixtures/mhgu/keys/TitleMsg_eng.gmd",
)
it.skipIf(!existsSync(labelFilePath))(
  "should decode, encode, re-decode a file with keys",
  async () => {
    const file = await fs.readFile(labelFilePath)
    const data = decodeGmd(file)

    expect(data.entries[0].key).toMatchInlineSnapshot(`"GameModeSelection"`)
    expect(data.entries[0].text).toMatchInlineSnapshot(`"Main Menu"`)
    expect(data.entries[1].key).toMatchInlineSnapshot(`"GameDataSelection"`)
    expect(data.entries[1].text).toMatchInlineSnapshot(`"Character Select"`)
    expect(data.entries[2].key).toMatchInlineSnapshot(`"GameOptions"`)
    expect(data.entries[2].text).toMatchInlineSnapshot(`"Game Options"`)

    const binary = encodeGmd(data)
    // writeFileSync("test.gmd", binary)
    expect(binary.subarray(0x31, 4 * 6 * 10).toString("hex")).toStrictEqual(
      file.subarray(0x31, 4 * 6 * 10).toString("hex"),
    )

    const reDecoded = decodeGmd(binary)
    expect(reDecoded).toStrictEqual(data)
  },
)

const fixtures = await new fdir().withBasePath().crawl("./fixtures/mhgu").withPromise()

it.each(fixtures)("should decode, encode, re-decode files %#", async (fixture) => {
  const file = await fs.readFile(path.join(import.meta.dirname, "..", fixture))
  const data = decodeGmd(file)

  const binary = encodeGmd(data)
  expect(binary.toString("hex")).toStrictEqual(file.toString("hex"))

  const reDecoded = decodeGmd(binary)
  expect(reDecoded).toStrictEqual(data)
})
