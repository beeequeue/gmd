# @beequeue/gmd

[![npm](https://img.shields.io/npm/v/@beequeue/gmd)](https://www.npmjs.com/package/@beequeue/gmd)
![npm bundle size](https://deno.bundlejs.com/?q=@beequeue/gmd&badge)
![node-current](https://img.shields.io/node/v/@beequeue/gmd)

A library for parsing and serializing GMD files for the MT Framework engine, more specifically for Monster Hunter: Generations Ultimate.

## Usage

```typescript
import { readFileSync } from "fs"
import { encodeGmd, decodeGmd } from "@beequeue/gmd"

const buffer = readFileSync("./somefile.gmd")
const json = decodeGmd(buffer)
const data = encodeGmd(json)
```
