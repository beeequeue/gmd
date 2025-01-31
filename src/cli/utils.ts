import fs from "node:fs"

import colors from "tinyrainbow"

const indent = (str: string, spaces: number): string => {
  const lines = str.split("\n")
  if (lines.length <= 1) return str

  const space = " ".repeat(spaces)
  return lines.map((line, index) => (index !== 0 ? `${space}${line}` : line)).join("\n")
}

export const logError = <Exit extends boolean>(
  error: Error | string,
  exit?: Exit,
): Exit extends true ? never : void => {
  const message = error instanceof Error ? error.message : error
  console.error(colors.red(`❌ ${indent(message, 3)}`))

  if (exit) {
    process.exit(1)
  }

  return undefined as never
}

let memoizedDir: [string, boolean] | null = null
export const checkIfDir = (input: string): boolean => {
  if (input == null) return false
  if (memoizedDir?.[0] === input) return memoizedDir[1]

  let result = false
  try {
    result = fs.lstatSync(input).isDirectory()
  } catch {}

  memoizedDir = [input, result]
  return result
}
