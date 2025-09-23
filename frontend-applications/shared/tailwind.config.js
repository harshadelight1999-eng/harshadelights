/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Harsha Delights brand colors
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
        // Royal Luxury Color Palette
        royal: {
          50: '#f8f6ff',
          100: '#f0ebff',
          200: '#e3daff',
          300: '#d0bfff',
          400: '#b89aff',
          500: '#9c6eff',
          600: '#8b4cf7',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        luxury: {
          gold: {
            50: '#fffdf7',
            100: '#fff9e6',
            200: '#fff2cc',
            300: '#ffe699',
            400: '#ffd633',
            500: '#ffc107',
            600: '#e6ac00',
            700: '#cc9900',
            800: '#b38600',
            900: '#996600',
          },
          burgundy: {
            50: '#fdf2f2',
            100: '#fbe8e8',
            200: '#f5d0d0',
            300: '#ebb5b5',
            400: '#dc8f8f',
            500: '#c86a6a',
            600: '#b04848',
            700: '#8b2f2f',
            800: '#721f1f',
            900: '#5a1818',
          },
          champagne: {
            50: '#fefdf9',
            100: '#fdf9f0',
            200: '#fbf2d9',
            300: '#f7e6b8',
            400: '#f1d391',
            500: '#e8bc5e',
            600: '#d4a041',
            700: '#b8812a',
            800: '#966521',
            900: '#79511e',
          },
        },
        // Brand-specific colors (keeping existing)
        "harsha-orange": {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        "harsha-yellow": {
          50: "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#facc15",
          500: "#eab308",
          600: "#ca8a04",
          700: "#a16207",
          800: "#854d0e",
          900: "#713f12",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
        royal: ['Playfair Display', 'serif'],
        luxury: ['Cormorant Garamond', 'serif'],
        elegant: ['Crimson Text', 'serif'],
        premium: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'royal-gradient': 'linear-gradient(135deg, #7c3aed 0%, #8b4cf7 50%, #9c6eff 100%)',
        'gold-gradient': 'linear-gradient(135deg, #ffc107 0%, #e6ac00 50%, #cc9900 100%)',
        'luxury-gradient': 'linear-gradient(135deg, #581c87 0%, #7c3aed 25%, #ffc107 75%, #e6ac00 100%)',
        'royal-shimmer': 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
        // Dynamic backgrounds from assets
        'hero-bg-1': "url('/assets/branding/backgrounds/BG01.png')",
        'hero-bg-2': "url('/assets/branding/backgrounds/BG-02.png')",
        'hero-bg-3': "url('/assets/branding/backgrounds/BG-03.png')",
        'hero-bg-4': "url('/assets/branding/backgrounds/BG-04.png')",
        'hero-bg-5': "url('/assets/branding/backgrounds/BG-5.png')",
        'hero-bg-6': "url('/assets/branding/backgrounds/BG-06.png')",
        'hero-bg-7': "url('/assets/branding/backgrounds/BG-07.png')",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "bounce-subtle": "bounceSubtle 0.6s ease-in-out",
        'royal-shimmer': 'shimmer 2s infinite',
        'luxury-float': 'luxuryFloat 6s ease-in-out infinite',
        'gold-glow': 'goldGlow 3s ease-in-out infinite alternate',
        'royal-pulse': 'royalPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceSubtle: {
          "0%, 20%, 50%, 80%, 100%": { transform: "translateY(0)" },
          "40%": { transform: "translateY(-4px)" },
          "60%": { transform: "translateY(-2px)" },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        luxuryFloat: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(1deg)' },
        },
        goldGlow: {
          '0%': { boxShadow: '0 0 20px rgba(255, 193, 7, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(255, 193, 7, 0.6)' },
        },
        royalPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
      },
      boxShadow: {
        'royal': '0 20px 60px rgba(124, 58, 237, 0.15)',
        'luxury': '0 25px 50px rgba(0, 0, 0, 0.15)',
        'gold': '0 10px 30px rgba(255, 193, 7, 0.3)',
        'royal-inset': 'inset 0 2px 4px rgba(124, 58, 237, 0.1)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
};