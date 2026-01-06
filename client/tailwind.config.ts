import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Baby Tracker specific colors
        feeding: {
          DEFAULT: "hsl(var(--feeding))",
          glow: "hsl(var(--feeding-glow))",
        },
        diaper: {
          DEFAULT: "hsl(var(--diaper))",
          glow: "hsl(var(--diaper-glow))",
        },
        sleep: {
          DEFAULT: "hsl(var(--sleep))",
          glow: "hsl(var(--sleep-glow))",
        },
        pump: {
          DEFAULT: "hsl(var(--pump))",
          glow: "hsl(var(--pump-glow))",
        },
        // ATNN Design Palette Colors
        papaya: {
          DEFAULT: "hsl(var(--papaya))",
          light: "hsl(var(--papaya-light))",
        },
        sky: {
          DEFAULT: "hsl(var(--sky))",
          light: "hsl(var(--sky-light))",
        },
        saguaro: {
          DEFAULT: "hsl(var(--saguaro))",
          light: "hsl(var(--saguaro-light))",
        },
        "banana-cream": "hsl(var(--banana-cream))",
        linen: "hsl(var(--linen))",
        oxblood: "hsl(var(--oxblood))",
        // Legacy compatibility
        peach: {
          DEFAULT: "hsl(var(--peach))",
          light: "hsl(var(--peach-light))",
        },
        mint: {
          DEFAULT: "hsl(var(--mint))",
          light: "hsl(var(--mint-light))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 12px)",
      },
      boxShadow: {
        'soft': '0 4px 20px -5px hsl(0 29% 17% / 0.12)',
        'glow-feeding': '0 0 24px hsl(222 50% 65% / 0.35)',
        'glow-diaper': '0 0 24px hsl(60 50% 48% / 0.3)',
        'glow-primary': '0 0 24px hsl(16 100% 58% / 0.4)',
        'glow-pump': '0 0 24px hsl(16 100% 58% / 0.35)',
        'glow-papaya': '0 0 24px hsl(16 100% 58% / 0.4)',
        'glow-sky': '0 0 24px hsl(222 50% 65% / 0.35)',
        'glow-saguaro': '0 0 24px hsl(60 50% 48% / 0.3)',
        'glow-peach': '0 0 24px hsl(16 100% 58% / 0.4)',
        'glow-mint': '0 0 24px hsl(60 50% 48% / 0.3)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          from: { transform: "translateY(0)", opacity: "1" },
          to: { transform: "translateY(100%)", opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.9)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "bounce-soft": "bounce-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
