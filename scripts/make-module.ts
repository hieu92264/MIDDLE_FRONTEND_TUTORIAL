import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const moduleFolders = ['api', 'components', 'pages', 'queries', 'schemas', 'stores', 'types']

const [, , moduleName, ...flags] = process.argv
const dryRun = flags.includes('--dry-run')

function printUsage() {
  console.log('Usage: bun run make:module <module-name> [--dry-run]')
  console.log('Example: bun run make:module reports')
  console.log('Module name must be lowercase kebab-case, for example: auth, users, user-profile')
}

if (!moduleName) {
  printUsage()
  process.exit(1)
}

if (!/^[a-z][a-z0-9-]*$/.test(moduleName)) {
  console.error(`Invalid module name: ${moduleName}`)
  printUsage()
  process.exit(1)
}

const moduleRoot = resolve(process.cwd(), 'src', 'modules', moduleName)
const routesPath = join(moduleRoot, 'routes.ts')

console.log(`${dryRun ? '[dry-run] ' : ''}Creating module: ${moduleName}`)

for (const folder of moduleFolders) {
  const folderPath = join(moduleRoot, folder)
  const gitkeepPath = join(folderPath, '.gitkeep')

  if (dryRun) {
    console.log(`- ${folderPath}`)
    continue
  }

  await mkdir(folderPath, { recursive: true })

  if (!existsSync(gitkeepPath)) {
    await writeFile(gitkeepPath, '')
  }

  console.log(`- ${folderPath}`)
}

if (dryRun) {
  console.log(`- ${routesPath}`)
} else if (!existsSync(routesPath)) {
  await writeFile(
    routesPath,
    `import type { RouteRecordRaw } from 'vue-router'\n\nexport const ${moduleName.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())}Routes: RouteRecordRaw[] = []\n`,
  )
  console.log(`- ${routesPath}`)
}

console.log(`${dryRun ? '[dry-run] ' : ''}Done.`)
