import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ts from 'typescript'
import { expect, it } from 'vitest'

it('resolves emitted icon paths from the bundle even when cwd differs', () => {
  const compiled = ts.transpileModule(readFileSync(new URL('./icons.ts', import.meta.url), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText
  const bundle = resolve('bundle-directory')
  const module = { exports: {} as Record<string, string> }
  new Function('require', 'module', 'exports', '__dirname', compiled)((id: string) => {
    if (id === 'path') return { resolve }
    return { default: `./${id.split('/').pop()}` }
  }, module, module.exports, bundle)
  expect(module.exports.lightTray).toBe(resolve(bundle, 'light@tray.png'))
  expect(module.exports.darkIco).toBe(resolve(bundle, 'dark.ico'))
})
