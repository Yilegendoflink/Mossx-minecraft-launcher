/** Write public release checksums and provenance. Does not publish or upload. */
const { createHash } = require('node:crypto')
const { createReadStream } = require('node:fs')
const { readdir, stat, writeFile } = require('node:fs/promises')
const { resolve, join } = require('node:path')
const { execFileSync } = require('node:child_process')
async function sha256(path) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(path)) hash.update(chunk)
  return hash.digest('hex')
}
async function main() {
  const directory = resolve(process.argv[2] || 'xmcl-electron-app/build/moss-release/0.72.0-moss.1')
  const names = (await readdir(directory)).filter(name => /\.(exe|zip|blockmap)$/.test(name)).sort()
  if (!names.some(name => name.endsWith('.exe')) || !names.some(name => name.endsWith('.zip'))) throw new Error('Both installer and portable ZIP must exist')
  const artifacts = []
  for (const name of names) artifacts.push({ name, bytes: (await stat(join(directory, name))).size, sha256: await sha256(join(directory, name)) })
  await writeFile(join(directory, 'SHA256SUMS.txt'), artifacts.map(file => `${file.sha256}  ${file.name}`).join('\n') + '\n')
  const manifest = {
    product: 'MOSS X', version: '0.72.0-moss.1', upstreamVersion: '0.72.0', platform: 'windows-x64',
    sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    sourceBranch: execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim(),
    builtAt: new Date().toISOString(), signed: false, updateMode: 'manual-moss-release', artifacts,
  }
  await writeFile(join(directory, 'release-manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
  console.log(JSON.stringify(manifest, null, 2))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
