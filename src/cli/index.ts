#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"

import { parse } from "@bomb.sh/args"
import { Presets, SingleBar } from "cli-progress"
import { fdir } from "fdir"
import type { PathsOutput } from "fdir"
import type { APIBuilder } from "fdir/dist/builder/api-builder.js"
import isGlob from "is-glob"
import pico from "picomatch"
import colors from "tinyrainbow"

import { decodeGmd } from "../decode.ts"
import { encodeGmd } from "../encode.ts"

import { checkIfDir, findCommonPathStart, getOutputPath } from "./path-utils.ts"
import { fromJson, logError, toJson } from "./utils.ts"

const args = parse(process.argv.slice(2), {
  boolean: ["help", "print"],
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
  --print           ${colors.gray("Print output to console instead of writing to file (only works with one file input)")}
`.trim()

if (args.help) {
  console.log(help)
  process.exit(0)
}

const command = args._[0]
if (command !== "decode" && command !== "encode") {
  console.log(help)
  logError("Invalid command, should be 'decode' or 'encode'.")
  process.exit(1)
}
if (command !== "decode" && args.print) {
  logError("The --print option only works with the 'decode' command")
  process.exit(1)
}

const input = (args._[1] as string)?.replaceAll(/\\/g, "/")
if (input == null) {
  logError("Missing input file, directory, or glob")
  process.exit(1)
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

if (args.print && uniqueInputFiles.length !== 1) {
  logError("The --print option only works with a single input file")
  process.exit(1)
}
if (uniqueInputFiles.length === 0) {
  logError("No input files found")
  process.exit(1)
}

let commonDirIndex: number | undefined
if (args.out != null) {
  commonDirIndex = findCommonPathStart(uniqueInputFiles)
}

if (args.print) {
  const data = fs.readFileSync(uniqueInputFiles[0])
  const output = decodeGmd(data)

  console.log(toJson(output))
  process.exit(0)
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
