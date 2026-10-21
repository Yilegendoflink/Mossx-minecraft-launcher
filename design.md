# MOSS X · XMCL design system

Product name: MOSS X. Identify this fork as the visual and Chinese UX edition
of X Minecraft Launcher (XMCL), with ci010, contributors and upstream license
attribution retained in About.

Brand icon: flat monochrome X and a detached leaf, without outlines or fold
shading. The canonical SVG is `xmcl-keystone-ui/src/assets/moss-x.svg`; UI
logos use an SVG mask with the current primary color (sidebar 32px, About
40px, startup 64px). Startup remembers the last effective palette. Native
windows/tray/EXE use fixed generated PNG/ICO assets; tiles provide contrast
in system surfaces. Caption: X-Launcher个人美化版本. The upstream About block
keeps the XMCL logo and original project information explicitly labelled.

This fork retains XMCL's routes, components, services, keyboard/gamepad controls,
theme import/export and instance data. UI changes extend the existing renderer.

## Direction

The user requested the previously approved Moss interface: a forest-green
workbench with pale sage navigation, a light canvas, solid cards, quiet borders
and clear text labels. This is an application-wide system, not a per-page theme.

## Layout

- App pages: Workbench; vertical labelled navigation at desktop sizes.
- Retain the existing horizontal/notch sidebar modes and theme controls.
- Validate the launcher's real supported sizes: 1200 × 720 and 800 × 400.
- Responsive compact mode collapses labels; it never removes feature access.
- Preserve the home focus/dashboard switch and all instance content cards.

## Tokens

Semantic CSS tokens are in `tokens.css`, imported through `moss.css` in the
main-window component. Colors consume the existing runtime theme variables so
custom user themes continue working. New installations start with the Moss
light palette; dark mode has a complementary forest palette.

| Role | Default |
| --- | --- |
| Canvas | #f6f8f5 |
| Sidebar | #eaf0e8 |
| Card | #ffffff |
| Ink | #243b30 |
| Muted text | #66756b |
| Primary | #254d3c |
| Selected | #d8e7d9 |
| Border | #dce5dc |

Display: Bahnschrift / Trebuchet MS, Chinese fallback Microsoft YaHei UI.
Body: Microsoft YaHei UI / PingFang SC / Segoe UI. Keep custom-font support.
Use the existing Material icon system; the Moss sprout mark is an original SVG.

## Biome variants

Eight built-in palettes (forest, cherry grove, snow, desert, ocean, swamp,
Nether and End) pair light/dark colors with original pixel landscapes on the
home panel. Selection is saved with the existing global or instance theme and
survives theme export/import. Custom colors, backgrounds and fonts remain editable.
Chinese community links are labelled as browser destinations; they do not
masquerade as integrated download APIs.

Community catalogue selections share the store's right pane, keyword field,
version/loader filters and pagination. Cards show source text and an explicit
original-page action. Capability hints distinguish native metadata filters
from text matching; unsupported international source categories are hidden.

All six sources are peer cards in one three-column source grid. Every card
uses the same include/exclude toggle and accessible pressed state. Mixed
source selections interleave provider pages in one result grid and share
pagination, preserving each provider's own ranking and source attribution.

## Interaction

Title-bar navigation remains available in every desktop sidebar layout. It
offers direct page links, pinning a hidden dock and restoring the default
left sidebar. New dock selections stay visible until auto-hide is enabled.

Replace legacy WebGL Halo/particle backgrounds with a quiet CSS tile drift.
Page navigation uses a short fade/lift; actions use small hover/press feedback.
Biome scenery contains a few slow drifting flecks. Respect reduced-motion;
keep an explicit no-background option and custom image/video support.

Primary actions use the runtime primary color. Secondary actions use solid
surfaces and restrained borders. Preserve loading/disabled/error states and
native keyboard semantics. Focus rings appear immediately. Respect reduced
motion. Do not replace working dialogs, virtualized lists or drag-and-drop.

## Exports

- CSS: `tokens.css` exposes `--moss-*` variables backed by XMCL's live theme.
- Vuetify: the light/dark defaults are in `src/vuetify.ts` and
  `src/composables/theme.ts` under `xmcl-keystone-ui`.
- Other token formats are not runtime dependencies of this Vue/Vuetify app.
