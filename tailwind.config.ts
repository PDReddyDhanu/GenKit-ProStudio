import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['"Space Grotesk"', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-down': {
            '0%': { transform: 'translateY(-20px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'card-in': {
            '0%': { transform: 'translateY(30px) rotateX(-10deg) scale(0.95)', opacity: '0' },
            '100%': { transform: 'translateY(0) rotateX(0deg) scale(1)', opacity: '1' },
        },
        'lightning-flash': {
          '0%': { opacity: '0' },
          '2%': { opacity: '0.1', 'background-color': '#fff' },
          '4%': { opacity: '0.8', 'background-color': '#e0e7ff', filter: 'blur(8px)'},
          '8%': { opacity: '0.2' },
          '10%': { opacity: '1', 'background-color': 'white', filter: 'blur(20px)' },
          '30%': { opacity: '0' },
          '100%': { opacity: '0' },
        },
        'text-flicker': {
          '0%': { opacity: '0', 'text-shadow': 'none' },
          '10%': { opacity: '0', 'text-shadow': 'none' },
          '10.1%': { opacity: '1', 'text-shadow': '0 0 5px #fff, 0 0 15px #fff, 0 0 25px hsl(var(--primary))' },
          '10.2%': { opacity: '0', 'text-shadow': 'none' },
          '15%': { opacity: '0', 'text-shadow': 'none' },
          '15.1%': { opacity: '1', 'text-shadow': '0 0 5px #fff, 0 0 15px #fff, 0 0 25px hsl(var(--primary))' },
          '25%': { opacity: '1', 'text-shadow': '0 0 5px #fff, 0 0 15px #fff, 0 0 25px hsl(var(--primary))' },
          '25.1%': { opacity: '0', 'text-shadow': 'none' },
          '25.2%': { opacity: '1', 'text-shadow': '0 0 5px #fff, 0 0 15px #fff, 0 0 25px hsl(var(--primary))' },
          '30%': { opacity: '1', 'text-shadow': '0 0 5px #fff, 0 0 15px #fff, 0 0 25px hsl(var(--primary))' },
          '40%': { opacity: '1', 'text-shadow': '0 0 5px #fff, 0 0 15px #fff, 0 0 25px hsl(var(--primary))' },
          '100%': { opacity: '1', 'text-shadow': '0 0 5px #fff, 0 0 15px #fff, 0 0 25px hsl(var(--primary))' },
        },
        'slow-zoom': {
          '0%': { transform: 'scale(1)', opacity: '0' },
          '10%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1.15)' },
        },
        'icon-fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.5)'},
          '50%': { opacity: '0', transform: 'scale(0.5)'},
          '70%': { opacity: '1', transform: 'scale(1.1)'},
          '100%': { opacity: '1', transform: 'scale(1)'},
        },
        'credits-fade-in': {
          '0%': { opacity: '0'},
          '80%': { opacity: '0'},
          '100%': { opacity: '0.7'},
        },
        'slow-float': {
          '0%': { transform: 'translateY(0) rotateX(0) rotateY(0)' },
          '50%': { transform: 'translateY(-10px) rotateX(5deg) rotateY(-5deg)' },
          '100%': { transform: 'translateY(0) rotateX(0) rotateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-in-out forwards',
        'slide-in-up': 'slide-in-up 0.5s ease-in-out forwards',
        'slide-in-down': 'slide-in-down 0.5s ease-in-out forwards',
        'card-in': 'card-in 0.6s ease-out forwards',
        'lightning-flash': 'lightning-flash 2.8s ease-out infinite',
        'text-flicker': 'text-flicker 4s ease-in-out forwards',
        'slow-zoom': 'slow-zoom 4s ease-out forwards',
        'icon-fade-in': 'icon-fade-in 4s ease-out forwards',
        'credits-fade-in': 'credits-fade-in 4s ease-out forwards',
        'slow-float': 'slow-float 12s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
