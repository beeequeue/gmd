# @beequeue/gmd

[![npm](https://img.shields.io/npm/v/@beequeue/gmd)](https://www.npmjs.com/package/@beequeue/gmd)
![npm bundle size](https://deno.bundlejs.com/?q=@beequeue/gmd&badge)
![node-current](https://img.shields.io/node/v/@beequeue/gmd)

A library for parsing and serializing GMD files for the MT Framework engine, more specifically for Monster Hunter: Generations Ultimate.

Largely based on the work in [onepiecefreak3/GMDConverter](https://github.com/onepiecefreak3/GMDConverter).

## Usage (CLI)

```sh
pnpm install -g @beequeue/gmd
gmd --help
```

The input can be a file, directory, or glob pattern.

By default the output will be written to the same directory as the input file.

`--option` can be used to change this to a specific directory.

```sh
gmd decode --output ./output path/to/files/**/*.gmd
gmd encode ./output/**/*
```

## Usage

```typescript
import { readFileSync } from "fs"
import { encodeGmd, decodeGmd } from "@beequeue/gmd"

const buffer = readFileSync("./somefile.gmd")
const json = decodeGmd(buffer)
const data = encodeGmd(json)
```
