# Global Conflict Explorer
## Design System & UI Guidelines
Version 1.0

---

# Design Philosophy

Global Conflict Explorer is **not a dashboard**.

It is an interactive editorial visualization for exploring global conflict history.

The interface should disappear into the background, allowing the data and map to become the primary storytelling medium.

Users should feel like they are reading an interactive article from Reuters Graphics, Financial Times, Our World in Data, or The Pudding—not using enterprise analytics software.

The design language should be:

- Quiet
- Editorial
- Scientific
- Trustworthy
- Minimal
- Timeless
- Geographic
- Data-first

Avoid decorative UI elements that compete with the visualization.

---

# Core Principles

## 1. Data First
Every visual decision should prioritize the readability of data.
The map is the hero.
Everything else exists only to help users explore it.

## 2. Progressive Disclosure
Reveal information gradually.

Hover Country
→ Basic Information
→ Click Country
→ Conflict Connections
→ Apply Filters
→ Detailed KPIs

## 3. Minimal Interface
Avoid:
- Floating cards
- Glassmorphism
- Neon colors
- Heavy shadows
- Bright gradients
- Decorative icons
- Animated backgrounds

## 4. Motion With Purpose
Animations should explain change.

Good:
- Country fade
- Arc growth
- Bubble resize
- Timeline playback

Avoid:
- Bounce
- Elastic
- Rotation effects

---

# Inspiration

Use these references for visual quality:

- Our World in Data
- Financial Times Visual Journalism
- Reuters Graphics
- The Pudding
- ObservableHQ
- New York Times Interactive

Do not copy layouts.
Match their visual maturity and editorial quality.

---

# Layout

- Large world map occupies ~75% width.
- Right sidebar occupies ~25%.
- Header contains search and legend.
- Timeline below the map.
- Death severity filter below timeline.
- Sidebar contains:
  - Country Summary
  - Filters
  - Legend

The visualization must always dominate the interface.

---

# Grid

12-column responsive grid.

Margins:
- Desktop: 72px
- Tablet: 48px
- Mobile: 24px

Spacing scale:
4, 8, 12, 16, 24, 32, 48, 64, 96

---

# Typography

Primary Font:
- Inter

Fallback:
- IBM Plex Sans

Avoid:
- Poppins
- Montserrat
- Nunito

Hierarchy:

Display
- 40px
- Weight 600

Page Heading
- 28px
- Weight 600

Section Heading
- 18px
- Weight 600

Body
- 14px
- Weight 400

Labels
- 12px
- Weight 500

---

# Color System

Background: #FAFAF9

Panel: #FFFFFF

Primary Text: #202124

Secondary Text: #5F6368

Border: #E5E7EB

Ocean: #F5F5F5

Inactive Country: #D6D6D6

---

# Conflict Color Scale

| Deaths | Color |
|--------|--------|
| 10–100 | #FDECEC |
| 100–500 | #F7B7B7 |
| 500–1000 | #EF6A6A |
| 1000–5000 | #C62828 |
| 5000+ | #5C0A0A |

Use the same palette for:
- Country Fill
- Connection Lines
- Bubble Color
- Legend
- KPI Indicators

---

# Components

Use Material Design 3.

Preferred components:

- Search Bar
- Filter Chips
- Assist Chips
- Slider
- Segmented Buttons
- Menus
- Tooltip
- Divider
- Navigation Rail (optional)
- Progress Indicator

Avoid custom controls unless required.

---

# Search

Searching a country should:

- Highlight it
- Zoom to it
- Update KPI
- Draw conflict connections

---

# Timeline

Use Material Slider.

Include:

- Current Year
- Play
- Pause
- Playback Speed

Timeline updates should animate.

---

# Death Severity Filter

Use Material Filter Chips.

Options:

- 10–100
- 100–500
- 500–1000
- 1000–5000
- 5000+

Each chip previews its color.

---

# Country States

Inactive:
- Light Grey

Active:
- Red

Selected:
- Dark Red with thin outline

Hover:
- Slight brightness increase

Never use glow.

---

# Conflict Connections

Always use curved geographic arcs.

Never use straight lines.

Encoding:

- Thickness → Battle deaths
- Color → Death severity
- Opacity → Conflict intensity

Animate arcs from source to destination.

---

# Hover Panel

Show:

- Country
- Conflict Count
- Battle Deaths
- Primary Opponent
- Conflict Type
- Supporting Country
- Years Active
- Region

Optional:
- Mini sparkline

---

# Sidebar

Width: 320px

Sticky.

Contains:

- Country Summary
- Filters
- Legend

Keep it lightweight.

---

# Motion

Durations:

- 200ms
- 300ms
- 500ms

Use Material easing.

Avoid bounce and spring animations.

---

# Accessibility

- WCAG AA contrast
- Keyboard accessible
- Hover alternatives on click
- Clear legends and labels

---

# Performance

- Do not redraw the whole SVG.
- Update only changed elements.
- Reuse SVG nodes.
- Optimize for thousands of conflict records.

---

# Anti-Patterns

Avoid:

- Generic SaaS dashboards
- Glassmorphism
- Rainbow palettes
- Oversized cards
- Heavy shadows
- Floating widgets
- Decorative illustrations
- AI-style layouts

---

# Final Experience

The final product should feel like a professional editorial data visualization used by researchers, journalists, and policy analysts.

The map—not the interface—should always be the primary storytelling element.
