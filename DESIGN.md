# Interface design system

The redesign uses a calm editorial direction for a property marketplace serving seekers and owners equally. Large property photography leads, while compact controls support browsing and listing tasks.

## Tokens

- Canvas: warm off-white `#f7f7f2`; dark canvas `#101b1d`.
- Surface: white `#ffffff`; dark surface `#1b292b`.
- Text: deep ink `#162326`; muted `#687579`.
- Action: deep teal `#0d6e67`, with white text.
- Borders: quiet neutral `#dfe5e1`.
- Display: Manrope; body: DM Sans with system fallbacks.
- Standard content width: 1360px, with 24px desktop and 16px mobile gutters.
- Corners: 8–18px for controls and content panels. Large asymmetric image corners belong only to hero imagery.

## Composition

- The home first viewport pairs an oversized headline on deep teal with a full-height architectural photograph and a pale lime browsing action.
- Browsing continues on the warm canvas with a large editorial heading, a deep teal filter bar, square property imagery, and a map beside the cards on desktop. The layout stacks on smaller screens.
- The owner invitation spans the full page width in pale lime, giving owners a distinct entry path without repeating the hero's dark panel.
- About reverses the Home hero's composition: architectural photography leads on one side of a deep teal panel, followed by an editorial three-step list on the warm canvas and a pale lime owner invitation.
- Contact uses a deep teal introduction and a warm, focused form surface with the same pale lime action color. Labels, errors, and submit feedback support English and Arabic.
- Property detail views pair the listing photo with a deep teal summary, then present facts as an open ruled grid on the warm canvas. Contact stays in a focused side panel, and the map loads as it approaches the viewport.

## Motion and access

- A single short entrance on the home hero helps direct attention; hover movement is subtle and pointer-gated.
- Motion uses transforms and opacity, and yields to reduced-motion preferences.
- Focus rings remain visible, icon buttons have labels, and layout adapts from phone to wide desktop.
