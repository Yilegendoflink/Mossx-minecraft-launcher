import { test, expect } from '../../fixtures/packaged'
import { readFile } from 'node:fs/promises'

test('MOSS X branding covers native icons, sidebar, About and the loading screen', async ({ packaged }, testInfo) => {
  const page = await packaged.app.firstWindow()
  await page.waitForSelector('[data-testid="app-sidebar"]', { timeout: 30000 })
  await page.keyboard.press('Escape')
  await expect(page).toHaveTitle('MOSS X')
  if (await page.locator('.moss-brand small').innerText() !== 'X-Launcher个人美化版本') {
    await page.getByTestId('nav-settings').click()
    await page.getByRole('combobox', { name: /Language/ }).first().locator('xpath=..').click()
    await page.getByRole('option').filter({ hasText: '简体中文' }).first().click()
    await page.locator('.moss-brand').click()
  }
  await expect(page.locator('.moss-brand small')).toHaveText('X-Launcher个人美化版本')
  await expect(page.getByTestId('moss-brand-icon')).toHaveCSS('mask-image', /moss-x.*\.svg/)
  const native = await page.evaluate(async () => {
    const response = await fetch('http://launcher/icons/logoLight')
    if (!response.ok) throw new Error('Icon protocol failed: ' + response.status)
    return Array.from(new Uint8Array(await response.arrayBuffer()))
  })
  expect(Buffer.from(native).equals(await readFile(new URL('../../../xmcl-electron-app/icons/moss/light@256x256.png', import.meta.url)))).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('01-moss-x-home.png') })
  await page.getByTestId('nav-settings').click()
  const about = page.getByTestId('moss-about')
  await about.scrollIntoViewIfNeeded()
  await expect(about).toContainText('X-Launcher个人美化版本')
  await expect(about).toContainText('ci010')
  await expect(page.getByTestId('moss-about-icon')).toHaveCSS('mask-image', /moss-x.*\.svg/)
  await expect(page.getByText('原项目相关信息 · X Minecraft Launcher（XMCL）', { exact: true })).toBeAttached()
  await page.screenshot({ path: testInfo.outputPath('02-moss-x-about.png') })
  // Freeze the real packaged startup HTML before Vue mounts. Electron's local
  // protocol bypasses Playwright request routing, so omit only its module tag.
  const startup = await page.evaluate(async () => (await fetch('http://xmcl.runtime/index.html')).text())
  await page.setContent(startup.replace(/<script\b[^>]*type="module"[^>]*>[\s\S]*?<\/script>/gi, ''), { waitUntil: 'load' })
  await expect(page.getByTestId('moss-loading')).toBeVisible()
  await expect(page.getByTestId('moss-loading-icon')).toHaveCSS('mask-image', /moss-x.*\.svg/)
  await expect(page.getByTestId('moss-loading')).toContainText('X-Launcher个人美化版本')
  await page.screenshot({ path: testInfo.outputPath('03-moss-x-loading.png') })
})
