# UIPath Agent Orchestration - Color Palette

## Brand Colors

- **Primary Brand Color**: `#61CE70` (Green) - HSL: `hsl(151, 44%, 59%)`
- **Secondary Brand Color**: `#1085e4` (Blue) - HSL: `hsl(202, 88%, 47%)`
- **Brand Gradient**: Linear gradient from `#61CE70` to `#1085e4`

## Tailwind CSS Color Variables

### Light Mode
- Background: `hsl(0, 0%, 100%)` (White)
- Foreground: `hsl(0, 0%, 3.9%)` (Almost black)
- Primary: `hsl(0, 0%, 9%)` (Dark gray)
- Secondary: `hsl(0, 0%, 96.1%)` (Very light gray)
- Accent: `hsl(0, 0%, 96.1%)` (Very light gray)
- Muted: `hsl(0, 0%, 96.1%)` (Very light gray)
- Destructive: `hsl(0, 84.2%, 60.2%)` (Red)
- Border: `hsl(0, 0%, 89.8%)` (Light gray)

### Dark Mode
- Background: `hsl(0, 0%, 3.9%)` (Almost black)
- Foreground: `hsl(0, 0%, 98%)` (Almost white)
- Primary: `hsl(0, 0%, 98%)` (Almost white)
- Secondary: `hsl(0, 0%, 14.9%)` (Dark gray)
- Accent: `hsl(0, 0%, 14.9%)` (Dark gray)
- Muted: `hsl(0, 0%, 14.9%)` (Dark gray)
- Destructive: `hsl(0, 62.8%, 30.6%)` (Dark red)
- Border: `hsl(0, 0%, 14.9%)` (Dark gray)

## UI Component Colors

### Badges
- New: Green (`bg-green-500`)
- Featured: Brand primary (`#61CE70`)
- Popular: Purple (`bg-purple-500`)

### Buttons
- Primary: Brand gradient (green to blue)
- Secondary: Outlined with light gray border

## Implementation Details

The color palette is implemented through CSS variables in `src/index.css` and integrated with Tailwind CSS configuration. The brand colors are defined as HSL values to support both light and dark modes effectively.

### CSS Custom Properties
All colors are defined as CSS custom properties in the `:root` and `.dark` selectors, allowing for easy theming and consistent color usage across the application.

### Tailwind Integration
Colors are mapped to Tailwind's configuration in `tailwind.config.ts`, enabling the use of utility classes like `bg-primary`, `text-secondary`, etc.

### Component Updates
- Primary buttons now use the brand gradient
- Badges include new variants: new, featured, and popular
- Status indicators use the updated color palette