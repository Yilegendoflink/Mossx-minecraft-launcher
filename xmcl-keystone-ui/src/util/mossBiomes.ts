import type { UIThemeDataV1 } from '@/composables/theme'
import forest from '@/assets/moss-landscape.svg'
import cherry from '@/assets/biomes/cherry.svg'
import snow from '@/assets/biomes/snow.svg'
import desert from '@/assets/biomes/desert.svg'
import ocean from '@/assets/biomes/ocean.svg'
import swamp from '@/assets/biomes/swamp.svg'
import nether from '@/assets/biomes/nether.svg'
import end from '@/assets/biomes/end.svg'

export const mossBiomes = [
  { id: 'forest', image: forest, primary: '#254d3c', canvas: '#f6f8f5', sidebar: '#eaf0e8', darkPrimary: '#86b796', darkCanvas: '#17251e', darkSidebar: '#1c2d24', darkCard: '#20362a', shade: '#193929' },
  { id: 'cherry', image: cherry, primary: '#86435e', canvas: '#fcf7f9', sidebar: '#f4e8ee', darkPrimary: '#e7a5c2', darkCanvas: '#281d29', darkSidebar: '#342534', darkCard: '#40303f', shade: '#4d263e' },
  { id: 'snow', image: snow, primary: '#315e7e', canvas: '#f4f8fb', sidebar: '#e4edf4', darkPrimary: '#9dc9ea', darkCanvas: '#182733', darkSidebar: '#1d303f', darkCard: '#253b4c', shade: '#233f59' },
  { id: 'desert', image: desert, primary: '#805127', canvas: '#fcf8f1', sidebar: '#f2e9d8', darkPrimary: '#dfb679', darkCanvas: '#2e251c', darkSidebar: '#3b3023', darkCard: '#493b2c', shade: '#5d4029' },
  { id: 'ocean', image: ocean, primary: '#17687c', canvas: '#f1f9fa', sidebar: '#dfedef', darkPrimary: '#79cdd9', darkCanvas: '#112b35', darkSidebar: '#173742', darkCard: '#1e444e', shade: '#164354' },
  { id: 'swamp', image: swamp, primary: '#52662c', canvas: '#f7f9f1', sidebar: '#e9eedb', darkPrimary: '#bdce88', darkCanvas: '#242c1c', darkSidebar: '#2e3823', darkCard: '#3b452d', shade: '#354223' },
  { id: 'nether', image: nether, primary: '#963f35', canvas: '#fdf6f3', sidebar: '#f4e3de', darkPrimary: '#f2a08b', darkCanvas: '#311b1d', darkSidebar: '#3e2426', darkCard: '#4c2c2c', shade: '#54252c' },
  { id: 'end', image: end, primary: '#65538f', canvas: '#f8f6fc', sidebar: '#ece6f5', darkPrimary: '#c3afe9', darkCanvas: '#241f34', darkSidebar: '#30283f', darkCard: '#3c324e', shade: '#352747' },
] as const

export function getMossBiome(id?: string) {
  return mossBiomes.find(b => b.id === id) ?? mossBiomes[0]
}

/** Only replace palette roles; preserve custom media, typography and dark mode. */
export function applyMossBiome(theme: UIThemeDataV1, id: string) {
  const biome = mossBiomes.find(b => b.id === id)
  if (!biome) return
  theme.mossBiome = biome.id
  Object.assign(theme.colors, {
    lightPrimaryColor: biome.primary,
    lightAccentColor: biome.primary,
    lightAppBarColor: biome.canvas + 'FF',
    lightBackground: biome.canvas + 'FF',
    lightSideBarColor: biome.sidebar + 'FF',
    lightCardColor: '#FFFFFFFF',
    darkPrimaryColor: biome.darkPrimary,
    darkAccentColor: biome.darkPrimary,
    darkAppBarColor: biome.darkCanvas + 'FF',
    darkBackground: biome.darkCanvas + 'FF',
    darkSideBarColor: biome.darkSidebar + 'FF',
    darkCardColor: biome.darkCard + 'FF',
  })
}

