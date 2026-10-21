import { resolve } from 'path'
import darkIcoAsset from '../../icons/moss/dark.ico'
import darkIconAsset from '../../icons/moss/dark@256x256.png'
import darkTrayAsset from '../../icons/moss/dark@tray.png'
import lightIcoAsset from '../../icons/moss/light.ico'
import lightIconAsset from '../../icons/moss/light@256x256.png'
import lightTrayAsset from '../../icons/moss/light@tray.png'

// File-loader output is relative in development and absolute in production.
// Electron's native tray loader resolves relative paths against cwd, not the bundle.
export const darkIco = resolve(__dirname, darkIcoAsset)
export const darkIcon = resolve(__dirname, darkIconAsset)
export const darkTray = resolve(__dirname, darkTrayAsset)
export const lightIco = resolve(__dirname, lightIcoAsset)
export const lightIcon = resolve(__dirname, lightIconAsset)
export const lightTray = resolve(__dirname, lightTrayAsset)
