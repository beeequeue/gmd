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
