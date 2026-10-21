/** Package the already-compiled Moss fork without changing upstream build policy. */
import { build } from 'electron-builder'
import { resolve } from 'node:path'
import { cp } from 'node:fs/promises'
import { config } from './electron-builder.config'

const release = process.argv.includes('--release')
const releaseVersion = '0.72.0-moss.1'
const output = process.argv.slice(2).find(arg => !arg.startsWith('--')) || (release ? `build/moss-release/${releaseVersion}` : 'build/moss-deployment')

// `compile` only rebuilds main/preload; copy the latest renderer before packaging.
void cp(resolve('../xmcl-keystone-ui/dist'), resolve('dist/renderer'), { recursive: true, force: true }).then(() => build({
  dir: !release,
  x64: true,
  publish: 'never',
  config: {
    ...config,
    productName: 'MOSS X',
    extraMetadata: {
      productName: 'MOSS X',
      description: 'MOSS X - Personal visual edition of X-Launcher (XMCL), with Chinese UX improvements',
      repository: { type: 'git', url: 'https://github.com/Yilegendoflink/Mossx-minecraft-launcher.git' },
      ...(release ? { version: releaseVersion } : {}),
    },
    publish: [{ provider: 'github', owner: 'Yilegendoflink', repo: 'Mossx-minecraft-launcher', releaseType: 'draft' }],
    artifactName: 'MOSS-X-${version}-windows-${arch}.${ext}',
    extraFiles: release ? [
      { from: resolve('../RELEASE_NOTES.Moss.md'), to: '发行说明.md' },
      { from: resolve('../LICENSE'), to: 'LICENSE.XMCL.txt' },
    ] : [],
    appId: 'dev.moss.xmcl',
    electronDist: resolve('node_modules/electron/dist'),
    directories: { ...config.directories, output },
    ...(release ? { nsis: {
      oneClick: false,
      perMachine: false,
      allowToChangeInstallationDirectory: true,
      createDesktopShortcut: 'always' as const,
      shortcutName: 'MOSS X',
      runAfterFinish: false,
      deleteAppDataOnUninstall: false,
      license: resolve('../LICENSE'),
      installerLanguages: ['zh_CN', 'en_US'],
      artifactName: 'MOSS-X-${version}-windows-${arch}-setup.${ext}',
    } } : {}),
    // Apply the fork's icon and metadata without requiring a signing certificate.
    win: { ...config.win, electronLanguages: ['en-US', 'zh-CN'], ...(release ? { target: ['nsis', 'zip'] } : {}), icon: 'icons/moss/light.ico', signAndEditExecutable: true, signExecutable: false },
  },
})).catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
