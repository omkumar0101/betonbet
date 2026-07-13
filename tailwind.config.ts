import type { Config } from "tailwindcss";

// all in fixtures is set to tailwind v3 as interims solutions

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
  		},
  		colors: {
  			// ---- Oddiq brand palette ----
  			// dusty-grape, light-green (mint), olive, pale-slate, brick-red
  			grape: {
  				light: '#7c7aa3',
  				DEFAULT: '#68668f',
  				dark: '#4f4d70',
  			},
  			mint: '#a2f292',
  			olive: '#866f09',
  			slateblue: '#aaabbc',
  			brick: '#b8001f',

  			// Re-map the accent scales the UI already leans on so the whole
  			// site adopts the palette from one place:
  			//   yellow  -> olive-gold accent (Play now, highlights, prices)
  			//   green/emerald -> light-green mint (success, "Fair", wins)
  			//   red     -> brick-red (danger, loss, "Hot")
  			yellow: {
  				'50': '#fdf9e8',
  				'100': '#f9f0c4',
  				'200': '#f0e08d',
  				'300': '#e2c94f',
  				'400': '#cbac2b',
  				'500': '#a98d16',
  				'600': '#866f09',
  				'700': '#6a5808',
  				'800': '#4f4206',
  				'900': '#3a3004',
  			},
  			green: {
  				'50': '#f0fded',
  				'100': '#dcf9d4',
  				'200': '#c3f4b6',
  				'300': '#b0f0a0',
  				'400': '#a2f292',
  				'500': '#7fe268',
  				'600': '#5cc93f',
  				'700': '#45a02e',
  				'800': '#357a25',
  				'900': '#2a5f20',
  			},
  			emerald: {
  				'50': '#f0fded',
  				'100': '#dcf9d4',
  				'200': '#c3f4b6',
  				'300': '#b0f0a0',
  				'400': '#a2f292',
  				'500': '#7fe268',
  				'600': '#5cc93f',
  				'700': '#45a02e',
  				'800': '#357a25',
  				'900': '#2a5f20',
  			},
  			red: {
  				'50': '#fdecef',
  				'100': '#fbd0d6',
  				'200': '#f5a3ae',
  				'300': '#ec6577',
  				'400': '#db3350',
  				'500': '#b8001f',
  				'600': '#99001a',
  				'700': '#7d0016',
  				'800': '#5f0011',
  				'900': '#42000c',
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
