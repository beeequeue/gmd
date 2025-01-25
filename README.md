# @beequue/gmd

[![npm](https://img.shields.io/npm/v/@beequue/remsg)](https://www.npmjs.com/package/@beequue/remsg)
![npm bundle size](https://deno.bundlejs.com/?q=@beequue/remsg&badge)
![node-current](https://img.shields.io/node/v/@beequue/remsg)

A library for parsing and serializing MSG files for the RE Engine, more specifically for Monster Hunter: Rise.

## Usage

```typescript
import { readFileSync } from "fs"
import { encodeGmd, decodeGmd } from "@beequeue/gmd"

const data = readFileSync("./somefile.gmd")
const json = decodeGmd(data)
const msg = encodeGmd(json)
```
