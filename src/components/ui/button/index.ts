import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva(
  // Base — Shadcn v2 refined: tighter tracking, sharper radius, cleaner focus ring
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-md text-sm font-medium tracking-[-0.01em]',
    'transition-all duration-150 ease-out',
    'select-none cursor-pointer',
    'disabled:pointer-events-none disabled:opacity-40',
    'outline-none',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
    'active:scale-[0.98]',
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
  ].join(' '),
  {
    variants: {
      variant: {
        // Primary — solid, vivid
        default: [
          'bg-primary text-primary-foreground',
          'shadow-sm shadow-primary/20',
          'hover:brightness-110 hover:shadow-md hover:shadow-primary/25',
        ].join(' '),

        // Destructive — red solid
        destructive: [
          'bg-destructive text-white',
          'shadow-sm shadow-destructive/20',
          'hover:brightness-110 hover:shadow-md hover:shadow-destructive/25',
          'focus-visible:ring-destructive',
        ].join(' '),

        // Outline — clean border, subtle hover
        outline: [
          'border border-border bg-transparent text-foreground',
          'hover:bg-accent hover:border-accent-foreground/20',
          'dark:bg-transparent dark:border-border dark:hover:bg-accent/50',
        ].join(' '),

        // Secondary — muted fill
        secondary: [
          'bg-secondary text-secondary-foreground',
          'hover:bg-secondary/70',
        ].join(' '),

        // Ghost — invisible until hovered
        ghost: [
          'bg-transparent text-foreground',
          'hover:bg-accent hover:text-accent-foreground',
          'dark:hover:bg-accent/50',
        ].join(' '),

        // Link — minimal, underline on hover
        link: [
          'bg-transparent text-primary underline-offset-4',
          'hover:underline',
          'shadow-none',
          'active:scale-100',
        ].join(' '),

        // Success — green
        success: [
          'bg-emerald-500 text-white',
          'shadow-sm shadow-emerald-500/20',
          'hover:bg-emerald-600 hover:shadow-md hover:shadow-emerald-500/25',
        ].join(' '),

        // Warning — amber
        warning: [
          'bg-amber-500 text-white',
          'shadow-sm shadow-amber-500/20',
          'hover:bg-amber-600',
        ].join(' '),
      },

      size: {
        xs:      'h-7  px-2.5 text-xs  rounded-md gap-1 [&_svg:not([class*="size-"])]:size-3',
        sm:      'h-8  px-3   text-xs  rounded-md gap-1.5',
        default: 'h-9  px-4   text-sm  rounded-md gap-2',
        lg:      'h-10 px-5   text-sm  rounded-md gap-2',
        xl:      'h-11 px-6   text-base rounded-lg gap-2',
        icon:    'size-9  rounded-md',
        'icon-sm': 'size-8  rounded-md',
        'icon-xs': 'size-7  rounded-md',
        'icon-lg': 'size-10 rounded-md',
      },
    },

    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
