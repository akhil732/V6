---
name: Jyothishya Sanathanam
colors:
  surface: '#f3faff'
  surface-dim: '#c7dde9'
  surface-bright: '#f3faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e6f6ff'
  surface-container: '#dbf1fe'
  surface-container-high: '#d5ecf8'
  surface-container-highest: '#cfe6f2'
  on-surface: '#071e27'
  on-surface-variant: '#454652'
  inverse-surface: '#1e333c'
  inverse-on-surface: '#dff4ff'
  outline: '#767683'
  outline-variant: '#c6c5d4'
  surface-tint: '#4c56af'
  primary: '#000666'
  on-primary: '#ffffff'
  primary-container: '#1a237e'
  on-primary-container: '#8690ee'
  inverse-primary: '#bdc2ff'
  secondary: '#825500'
  on-secondary: '#ffffff'
  secondary-container: '#feaa00'
  on-secondary-container: '#684300'
  tertiary: '#270054'
  on-tertiary: '#ffffff'
  tertiary-container: '#420484'
  on-tertiary-container: '#af80f5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e0e0ff'
  primary-fixed-dim: '#bdc2ff'
  on-primary-fixed: '#000767'
  on-primary-fixed-variant: '#343d96'
  secondary-fixed: '#ffddb3'
  secondary-fixed-dim: '#ffb950'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#624000'
  tertiary-fixed: '#eddcff'
  tertiary-fixed-dim: '#d7baff'
  on-tertiary-fixed: '#280056'
  on-tertiary-fixed-variant: '#5a2a9c'
  background: '#f3faff'
  on-background: '#071e27'
  surface-variant: '#cfe6f2'
typography:
  headline-display:
    fontFamily: Source Serif 4
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 42px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  safe-bottom: 80px
  container-margin: 20px
---

## Brand & Style

The design system is engineered for **Jyothishya Sanathanam**, a mobile-first astrology platform that bridges ancient wisdom with modern data science. The brand personality is **Institutional, Mystical, and Precise**. It avoids the "new-age" clichés of neon gradients in favor of a "Government-grade Spiritualism" aesthetic—one that suggests high-accuracy calculations and academic rigor.

The visual style is **Corporate-Modern with a Spiritual Soul**. It utilizes heavy whitespace and structured layouts to ensure complex astrological data remains legible. The emotional goal is to evoke **Equanimity and Trust**. Users should feel they are consulting a reliable digital archive rather than a casual entertainment app.

**Design Principles:**
*   **Thumb-Centricity:** All primary triggers and navigation exist within the natural reach of the thumb (bottom 40% of the screen).
*   **Information Hierarchy:** Follows a "Summary-to-Deep-Dive" flow. Use high-contrast headings to anchor the eye before revealing granular data tables.
*   **Data Integrity:** Visual cues must emphasize the source-driven nature of the calculations (e.g., Ayanamsa settings, lat/long coordinates).

## Colors

The palette is rooted in **Deep Midnight Blue (#1A237E)**, representing the vastness of the cosmos and institutional stability. This is the primary color for headers, active navigation states, and primary buttons.

*   **Primary Action:** A warm **Saffron Gold (#FFAB00)** is reserved strictly for the "One Primary CTA" per screen, ensuring it vibrates against the cool blue tones.
*   **Secondary/Spiritual Accents:** **Cosmic Purple (#4A148C)** is used sparingly for planetary glyphs and secondary highlights in deep reports.
*   **Confidence Indicators:** A traffic-light system (Green/Yellow/Red) is used specifically for AI-generated summary accuracy, providing a quick visual heuristic for the reliability of a prediction.
*   **Neutrals:** High-legibility Slate Grays are used for body text to maintain a professional, academic feel.

## Typography

This design system employs a **dual-font strategy** to balance authority with utility.

*   **The Serif (Source Serif 4):** Used for headlines and section titles. It provides the "Sanathanam" (Eternal) feel—authoritative, classic, and serious.
*   **The Sans-Serif (Public Sans):** Chosen for its institutional clarity. It is used for all astrological data, coordinates, and body copy. It ensures that numbers and degrees are legible even at small sizes.
*   **Numerical Data:** For chart degrees and timestamps, use `data-mono` (Public Sans with tabular lining figures) to ensure vertical alignment in tables and lists.

## Layout & Spacing

The layout is **Mobile-First** and adheres to a strict **8px grid**. 

*   **Safe Zones:** A mandatory `safe-bottom` padding of 80px is applied to all scrollable views to prevent content from being obscured by the persistent Bottom Navigation bar.
*   **Primary CTA Placement:** The main action button for any screen must be anchored to the bottom of the viewport or placed within the "easy-reach" zone of the thumb.
*   **Progressive Disclosure:** Use `md` (24px) spacing between data blocks to prevent cognitive overload. Group related planetary data into cards with clear margins.
*   **Grid:** A 4-column fluid grid for mobile with 16px gutters. For chart widgets, use an aspect-ratio locked container to maintain geometric integrity across devices.

## Elevation & Depth

To maintain a sophisticated and modern feel, the design system avoids heavy shadows and skeuomorphism. Instead, it uses **Tonal Layering and Soft Ambient Shadows**.

*   **The Base:** The main background is a very light gray (`#FAFAFA`) to reduce eye strain.
*   **Surface Level:** Cards and data modules use a pure white surface (`#FFFFFF`).
*   **Shadows:** Use a single, highly diffused shadow style: `0px 4px 20px rgba(26, 35, 126, 0.08)`. The slight blue tint in the shadow links the elevation back to the primary brand color.
*   **Interactive State:** On press, cards should slightly decrease in elevation (reduce shadow) to provide tactile feedback, mimicking the "pressing into" the screen.

## Shapes

The shape language is **Structured and Trustworthy**. A `roundedness` of `2` (8px base radius) is applied to all interactive elements.

*   **Cards & Inputs:** Use the standard 8px radius. This provides a modern look that is softer than sharp corners but more serious than "bubble" UI styles.
*   **Primary CTA:** May use a slightly higher radius (up to 16px) to distinguish the one primary action from secondary list items.
*   **Astrological Charts:** The outer boundary of Kundali charts should remain sharp (0px) or very subtly rounded (4px) to respect the traditional geometric representation of the zodiac.

## Components

### Kundali Card
The primary list item for the "Saved Charts" library. 
- **Header:** Source Serif 4 (Body-LG).
- **Sub-data:** Public Sans (Body-SM) for DOB and Location.
- **Visual:** A small (48px) geometric glyph representing the Ascendant (Lagna) sign on the leading edge.

### Chart Widget
The core data visualization tool. 
- **Style:** North Indian (Diamond-based) or South Indian (Square-based) selectable.
- **Stroke:** 1px solid Primary Color.
- **Text:** Public Sans (Data-Mono) for planetary degrees.

### Progressive Form
- **Inputs:** Underlined or softly boxed fields with floating labels. 
- **Transitions:** Horizontal slide-in for each step (Date -> Time -> Place).
- **Navigation:** "Next" button always in the bottom-right thumb zone.

### Bottom Navigation
- **Height:** 64px.
- **Background:** White with a top-border (1px, Primary-light).
- **Icons:** Simple 2pt stroke weight. Active state uses Primary Color with a small gold dot indicator below the icon.

### Confidence Indicators
- **Visual:** A small circular dot (8px) next to AI summaries. 
- **Tooltip:** "Based on [X] source texts" to reinforce the "Data Integrity" principle.