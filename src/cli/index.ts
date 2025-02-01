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

import { checkIfDir, findCommonPathStart, getOutputPath } from "./path-utils.ts"
import { fromJson, logError, toJson } from "./utils.ts"

type Options = {
  help?: boolean
  out?: string
}

const args = mri<Options>(process.argv.slice(2), {
  boolean: ["help"],
  string: ["out"],
  alias: {
    h: "help",
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
    finish = builder
      .filter((file) => file.endsWith(command === "decode" ? ".gmd" : ".gmd.json"))
      .crawl(input)
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

let commonDirIndex: number | undefined
if (args.out != null) {
  commonDirIndex = findCommonPathStart(uniqueInputFiles)
}

const bar = new SingleBar({}, Presets.shades_classic)
bar.start(uniqueInputFiles.length, 0)

for (const inputFilePath of uniqueInputFiles) {
  const data = fs.readFileSync(inputFilePath)
  const output =
    command === "decode"
      ? toJson(decodeGmd(data))
      : encodeGmd(fromJson(data.toString("utf8")))

  const outputPath = getOutputPath(inputFilePath, commonDirIndex, args.out)

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, output)

  bar.increment(1)
}

bar.stop()
