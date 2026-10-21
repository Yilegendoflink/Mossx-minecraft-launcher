import { describe, expect, test } from 'vitest'
import { BackgroundType, getDefaultTheme } from '../composables/theme'
import { deserialize, serialize } from './theme.v1'
import { applyMossBiome, getMossBiome, mossBiomes } from './mossBiomes'

describe('theme.v1 round-trip', () => {
  test.each([BackgroundType.HALO, BackgroundType.PARTICLE])('replaces legacy %s effects with fresh motion', (legacy) => {
    const data = serialize(getDefaultTheme())
    data.settings!.backgroundType = legacy
    expect(deserialize(data).backgroundType).toBe(BackgroundType.MOSS)
  })
  test.each([BackgroundType.NONE, BackgroundType.MOSS, BackgroundType.IMAGE, BackgroundType.VIDEO])('preserves explicit %s background selection', (type) => {
    const theme = getDefaultTheme()
    theme.backgroundType = type
    expect(deserialize(serialize(theme)).backgroundType).toBe(type)
  })
  test.each(mossBiomes)('persists the $id biome with its palette without removing custom media', (biome) => {
    const theme = getDefaultTheme()
    theme.dark = 'system'
    theme.backgroundImage = { url: 'https://example.com/custom.png', type: 'image', mimeType: 'image/png' }
    theme.fontSize = 18
    applyMossBiome(theme, biome.id)
    const restored = deserialize(serialize(theme))
    expect(restored.mossBiome).toBe(biome.id)
    expect(restored.colors.lightPrimaryColor).toBe(biome.primary)
    expect(restored.colors.darkPrimaryColor).toBe(biome.darkPrimary)
    expect(restored.backgroundImage).toEqual(theme.backgroundImage)
    expect(restored.dark).toBe('system')
    expect(restored.fontSize).toBe(18)
  })

  test('old or unknown biome identifiers fall back without replacing a custom palette', () => {
    const theme = getDefaultTheme()
    theme.colors.lightPrimaryColor = '#123456'
    expect(getMossBiome(deserialize(serialize(theme)).mossBiome).id).toBe('forest')
    applyMossBiome(theme, 'unknown')
    expect(theme.colors.lightPrimaryColor).toBe('#123456')
    expect(getMossBiome('unknown').id).toBe('forest')
  })
  test('preserves muted background volume (0)', () => {
    const theme = getDefaultTheme()
    theme.backgroundVolume = 0
    const restored = deserialize(serialize(theme))
    expect(restored.backgroundVolume).toBe(0)
  })

  test('preserves zero blur values', () => {
    const theme = getDefaultTheme()
    theme.blur = { background: 0, card: 0, appBar: 0, sideBar: 0 }
    const restored = deserialize(serialize(theme))
    expect(restored.blur.background).toBe(0)
    expect(restored.blur.card).toBe(0)
    expect(restored.blur.appBar).toBe(0)
    expect(restored.blur.sideBar).toBe(0)
  })

  test('preserves backgroundColorOverlay = false', () => {
    const theme = getDefaultTheme()
    theme.backgroundColorOverlay = false
    const restored = deserialize(serialize(theme))
    expect(restored.backgroundColorOverlay).toBe(false)
  })

  test('preserves non-zero values', () => {
    const theme = getDefaultTheme()
    theme.backgroundVolume = 0.5
    theme.blur = { background: 3, card: 20, appBar: 4, sideBar: 5 }
    theme.backgroundColorOverlay = true
    const restored = deserialize(serialize(theme))
    expect(restored.backgroundVolume).toBe(0.5)
    expect(restored.blur.background).toBe(3)
    expect(restored.blur.card).toBe(20)
    expect(restored.blur.appBar).toBe(4)
    expect(restored.blur.sideBar).toBe(5)
    expect(restored.backgroundColorOverlay).toBe(true)
  })

  test('round-trips dark mode values', () => {
    for (const dark of [true, false, 'system'] as const) {
      const theme = getDefaultTheme()
      theme.dark = dark
      const restored = deserialize(serialize(theme))
      expect(restored.dark).toBe(dark)
    }
  })

  test('preserves colors', () => {
    const theme = getDefaultTheme()
    theme.colors.darkPrimaryColor = '#abcdef'
    const restored = deserialize(serialize(theme))
    expect(restored.colors.darkPrimaryColor).toBe('#abcdef')
  })
})
