import fs from "node:fs"
import path from "node:path"

import { Presets, SingleBar } from "cli-progress"
import { fdir } from "fdir"
import type { PathsOutput } from "fdir"
import type { APIBuilder } from "fdir/dist/builder/api-builder.js"
import isGlob from "is-glob"
import mri from "mri"
import pico from "picomatch"
import colors from "tinyrainbow"

import { decodeGmd } from "../decode.ts"
import { encodeGmd } from "../encode.ts"
import type { GMD } from "../types.ts"

import { checkIfDir, findCommonDir, logError } from "./utils.ts"

type Options = {
  help?: boolean
  force?: boolean
  out?: string
}

const args = mri<Options>(process.argv.slice(2), {
  boolean: ["help", "force"],
  string: ["out"],
  alias: {
    h: "help",
    f: "force",
    o: "out",
  },
})

const help = `
Usage: gmd <command> [options] <input>

Commands:
  decode            ${colors.gray("Decode one or more GMD files")}
  encode            ${colors.gray("Encode one or more GMD files")}

Options:
  <input>           ${colors.gray("file, directory, or glob pattern to process")}
  -h, --help        ${colors.gray("Show this help message")}
  -f, --force       ${colors.gray("Overwrite existing file(s)")}
  -o, --out         ${colors.gray("Output directory, defaults to same directory as input file")}
`.trim()

if (args.help) {
  console.log(help)
  process.exit(0)
}

const command = args._[0]
if (command !== "decode" && command !== "encode") {
  console.log(help)
  logError("Invalid command, should be 'decode' or 'encode'.", true)
}

const input = args._[1]?.replaceAll(/\\/g, "/")
if (input == null) {
  logError("Missing input file, directory, or glob", true)
}

const inputFiles: string[] = []

if (isGlob(input) || checkIfDir(input)) {
  let builder = new fdir().withPathSeparator("/")

  if (path.isAbsolute(input)) {
    builder = builder.withFullPaths()
  } else {
    builder = builder.withBasePath()
  }

  let finish: APIBuilder<PathsOutput>
  if (checkIfDir(input)) {
    finish = builder.filter((file) => file.endsWith(".gmd")).crawl(input)
  } else {
    const { base, glob } = pico.scan(input)
    finish = builder.glob(glob).crawl(base)
  }

  inputFiles.push(...(await finish.withPromise()))
} else {
  inputFiles.push(input)
}

const uniqueInputFiles = Array.from(new Set(inputFiles))

if (uniqueInputFiles.length === 0) {
  logError("No input files found", true)
}

let commonDir = ""
if (args.out != null) {
  commonDir = findCommonDir(uniqueInputFiles)
}

const bar = new SingleBar({}, Presets.shades_classic)
bar.start(uniqueInputFiles.length, 0)

for (const inputFilePath of uniqueInputFiles) {
  const data = fs.readFileSync(inputFilePath)
  const output =
    command === "decode"
      ? JSON.stringify(decodeGmd(data), null, 2)
      : encodeGmd(JSON.parse(data.toString("utf8")) as GMD)

  const outputFilename = `${path.basename(inputFilePath, ".gmd")}.gmd.json`
  const outputPath = path.join(
    args.out != null
      ? path.join(
          args.out,
          path.basename(commonDir),
          path.dirname(inputFilePath.slice(commonDir.length)),
        )
      : path.dirname(inputFilePath),
    outputFilename,
  )

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, output)

  bar.increment(1)
}

bar.stop()
