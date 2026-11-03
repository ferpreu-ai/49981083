# 49981083 DESIGN.md

> Auto-generated design system — reverse-engineered via static analysis by skillui.
> Frameworks: None detected
> Colors: 5 · Fonts: 1 · Components: 0
> Icon library: not detected · State: not detected
> Primary theme: light · Dark mode toggle: no · Motion: none

---

## 1. Visual Theme & Atmosphere

This is a **light-themed** interface with a cool, approachable feel. The light background emphasizes content clarity. Typography uses **Segoe UI** throughout — a clean, modern choice that maintains consistency. Spacing follows a **4px base grid** (compact density), with scale: 2, 4, 6, 8, 10, 12, 14, 16px. The palette is predominantly monochromatic with **#2f6feb** as the single accent color — used sparingly for interactive elements and emphasis.

---

## 2. Color Palette & Roles

| Token | Hex | Role | Use |
|---|---|---|---|
| background | `#ffffff` | background | Page background, darkest surface |
| border | `#e2e5ea` | surface | Card and panel backgrounds |
| text-muted | `#6b7280` | text-muted | Captions, placeholders, secondary info |
| accent | `#2f6feb` | accent | CTAs, links, focus rings, active states |
| accent-soft | `#e8f0fe` | accent | CTAs, links, focus rings, active states |

### CSS Variable Tokens

```css
--border: #e2e5ea;
--text-muted: #6b7280;
--accent: #2f6feb;
--accent-soft: #e8f0fe;
```


---

## 3. Typography Rules

**Font Stack:**
- **Segoe UI** — Heading 1, Heading 2, Heading 3, Body, Caption

| Role | Font | Size | Weight |
|---|---|---|---|
| Heading 1 | Segoe UI | 48px / 3rem | 700 |
| Heading 2 | Segoe UI | 32px / 2rem | 600 |
| Heading 3 | Segoe UI | 24px / 1.5rem | 600 |
| Body | Segoe UI | 16px / 1rem | 400 |
| Caption | Segoe UI | 12px / 0.75rem | 400 |

**Typographic Rules:**
- Use **Segoe UI** for all text — do not mix font families
- Maintain consistent hierarchy: no more than 3-4 font sizes per screen
- Headings use bold (600-700), body uses regular (400)
- Line height: 1.5 for body text, 1.2 for headings
- Use color and opacity for secondary hierarchy, not additional font sizes


---

## 4. Component Stylings

No components detected. Scan `src/components/` or `components/` to populate this section.

---

## 5. Layout Principles

- **Base spacing unit:** 4px
- **Spacing scale:** 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 32
- **Border radius:** 6px, 999px
- **Max content width:** 1080px

**Spacing as Meaning:**
| Spacing | Use |
|---|---|
| 4-8px | Tight: related items within a group |
| 12-16px | Medium: between groups |
| 24-32px | Wide: between sections |
| 48px+ | Vast: major section breaks |


---

## 6. Depth & Elevation

No box-shadow values detected. The design appears to use a flat visual style.


---

## 8. Do's and Don'ts

### Do's

- Use `#2f6feb` for interactive elements (buttons, links, focus rings)
- Use `#ffffff` as the primary page background
- Use **Segoe UI** for all UI text
- Follow the **4px** spacing grid for all margins, padding, and gaps
- Use border and background shifts for elevation — not shadows
- Use border-radius from the scale: 6px, 999px

### Don'ts

- Don't introduce colors outside this palette — extend the design tokens first
- Don't mix font families — use Segoe UI consistently
- Don't use arbitrary spacing values — stick to multiples of 4px
- Don't add box-shadow — this design system uses flat elevation
- Don't use gradients — the design uses solid colors only
- Don't use arbitrary border-radius values — pick from the defined scale
- Don't use backdrop-blur or blur effects

### Anti-Patterns (detected from codebase)

- No box-shadow on any element
- No gradient backgrounds
- No blur or backdrop-blur effects
- No zebra striping on tables/lists


---

## 9. Responsive Behavior

No breakpoints detected. Consider adding responsive breakpoints to the design system.

---

## 10. Agent Prompt Guide

Use these as starting points when building new UI:

### Build a Card

```
Background: #e2e5ea
Border: 1px solid var(--border)
Radius: 999px
Padding: 16px
Font: Segoe UI
No shadows — use borders and surface colors for depth.
```

### Build a Button

```
Primary: bg #2f6feb, text white
Ghost: bg transparent, border var(--border)
Padding: 8px 16px
Radius: 999px
Hover: opacity 0.9 or lighter shade
Focus: ring with #2f6feb
```

### Build a Page Layout

```
Background: #ffffff
Max-width: 1080px, centered
Grid: 4px base
Responsive: mobile-first, breakpoints from Section 9
```

### Build a Stats Card

```
Surface: #e2e5ea
Label: #6b7280 (muted, 12px, uppercase)
Value: var(--text-primary) (primary, 24-32px, bold)
Status: use success/warning/danger from Section 2
```

### Build a Form

```
Input bg: #ffffff
Input border: 1px solid var(--border)
Focus: border-color #2f6feb
Label: #6b7280 12px
Spacing: 16px between fields
Radius: 999px
```

### General Component

```
1. Read DESIGN.md Sections 2-6 for tokens
2. Colors: only from palette
3. Font: Segoe UI, type scale from Section 3
4. Spacing: 4px grid
5. Components: match patterns from Section 4
6. Elevation: flat, surface shifts
```
