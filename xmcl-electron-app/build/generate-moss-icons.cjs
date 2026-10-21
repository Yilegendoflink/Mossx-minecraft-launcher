/** Regenerate native assets from the canonical SVG; requires sharp, no build-policy changes. */
const { readFile, writeFile, mkdir } = require('node:fs/promises')
const { resolve } = require('node:path')
const sharp = require(process.argv[2] || 'sharp')
const root = resolve(__dirname, '../..')
const output = resolve(__dirname, '../icons/moss')
function ico(images) {
  const table = Buffer.alloc(6 + images.length * 16)
  table.writeUInt16LE(1, 2)
  table.writeUInt16LE(images.length, 4)
  let offset = table.length
  images.forEach(({ size, png }, i) => {
    const entry = 6 + i * 16
    table[entry] = table[entry + 1] = size === 256 ? 0 : size
    table.writeUInt16LE(1, entry + 4)
    table.writeUInt16LE(32, entry + 6)
    table.writeUInt32LE(png.length, entry + 8)
    table.writeUInt32LE(offset, entry + 12)
    offset += png.length
  })
  return Buffer.concat([table, ...images.map(i => i.png)])
}
async function main() {
  const source = await readFile(resolve(root, 'xmcl-keystone-ui/src/assets/moss-x.svg'), 'utf8')
  const paths = source.replace(/<svg[^>]*>|<\/svg>/g, '')
  const nativeSvg = background => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect x="8" y="8" width="240" height="240" rx="48" fill="${background}"/>${paths.replaceAll('#254d3c', '#edf5e8')}</svg>`
  await mkdir(output, { recursive: true })
  for (const variant of ['light', 'dark']) {
    const svg = Buffer.from(nativeSvg(variant === 'dark' ? '#172b22' : '#254d3c'))
    const images = await Promise.all([16, 24, 32, 48, 64, 128, 256].map(async size => ({ size, png: await sharp(svg).resize(size, size).png().toBuffer() })))
    await writeFile(resolve(output, variant + '.ico'), ico(images))
    await writeFile(resolve(output, variant + '@256x256.png'), images.at(-1).png)
    const tray = Buffer.from(source.replaceAll('#254d3c', variant === 'dark' ? '#edf5e8' : '#254d3c'))
    await sharp(tray).resize(32, 32).png().toFile(resolve(output, variant + '@tray.png'))
  }
  await sharp(Buffer.from(nativeSvg('#254d3c'))).resize(512, 512).png().toFile(resolve(output, 'moss-x-512.png'))
  console.log('Generated MOSS X light/dark PNG, multi-resolution ICO and transparent tray assets.')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
