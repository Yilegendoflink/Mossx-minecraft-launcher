import { join } from 'node:path'
import { ElectronUpdateOperation, type ReleaseInfo } from '@xmcl/runtime-api'

export const MOSS_PRODUCT_NAME = 'MOSS X'
export const MOSS_RELEASES_URL = 'https://github.com/Yilegendoflink/Mossx-minecraft-launcher/releases'

export function getMossProfileRoot(productName: string, appData: string, override?: string) {
  return override || (productName === MOSS_PRODUCT_NAME ? join(appData, 'MOSS X') : undefined)
}

/** Fork distributions must never install an upstream XMCL ASAR or installer. */
export function getMossUpdateInfo(productName: string, version: string): ReleaseInfo | undefined {
  if (productName !== MOSS_PRODUCT_NAME) return undefined
  return { name: version, body: `MOSS X releases: ${MOSS_RELEASES_URL}`, date: '', files: [], newUpdate: false, operation: ElectronUpdateOperation.Manual }
}

export function assertMossUpdateAllowed(productName: string) {
  if (productName === MOSS_PRODUCT_NAME) throw new Error(`MOSS X uses manual release packages: ${MOSS_RELEASES_URL}`)
}
