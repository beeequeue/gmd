import fs from "node:fs"
import path from "node:path"

export const findCommonPathStart = (paths: string[]): number => {
  const commonDir = paths.reduce((acc, filePath) => {
    const dir = path.dirname(filePath)
    if (dir.startsWith(acc)) return acc

    while (!dir.startsWith(acc)) {
      acc = acc.split("/").slice(0, -1).join("/")
    }

    return acc
  }, path.dirname(paths[0]))

  return commonDir.length + 1
}

const fixExtension = (filePath: string) =>
  filePath.endsWith(".json") ? filePath.slice(0, -5) : `${filePath}.json`

export const getOutputPath = (
  inputFilePath: string,
  commonDirIndex?: number,
  outDir?: string,
): string => {
  if (outDir == null) {
    return fixExtension(inputFilePath)
  }

  const inputPathWithoutCommonPath = inputFilePath.slice(commonDirIndex)
  const outputPath = `${outDir}/${inputPathWithoutCommonPath}`
  return fixExtension(outputPath)
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
