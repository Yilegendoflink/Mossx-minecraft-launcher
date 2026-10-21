import { expect, test } from 'vitest'
import { join } from 'node:path'
import { assertMossUpdateAllowed, getMossProfileRoot, getMossUpdateInfo } from './mossDistribution'

test('isolates distribution profiles while retaining explicit workspace/test paths', () => {
  expect(getMossProfileRoot('MOSS X', '/appdata')).toBe(join('/appdata', 'MOSS X'))
  expect(getMossProfileRoot('MOSS X', '/appdata', '/owned-profile')).toBe('/owned-profile')
  expect(getMossProfileRoot('Electron', '/appdata')).toBeUndefined()
})
test('MOSS X reports manual updates and rejects stale upstream download/install requests', () => {
  expect(getMossUpdateInfo('MOSS X', '0.72.0-moss.1')).toMatchObject({ newUpdate: false, operation: 'manual', files: [] })
  expect(() => assertMossUpdateAllowed('MOSS X')).toThrow('manual release packages')
  expect(getMossUpdateInfo('XMCL', '0.72.0')).toBeUndefined()
  expect(() => assertMossUpdateAllowed('XMCL')).not.toThrow()
})
