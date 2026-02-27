/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				cream: "#FCFBF8",
				"cream-dark": "#F5F5F5",
				noir: "#0A0A0A",
				"noir-soft": "#1A1A1A",
				rose: "#C9A99A",
				"rose-light": "#E8D5CC",
				"rose-dark": "#9A6F5E",
				muted: "#6B6560",
				"muted-light": "#9E9791",
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
			},
			fontFamily: {
				display: ["var(--font-playfair)", "serif"],
				sans: ["var(--font-inter)", "sans-serif"],
			},
			fontSize: {
				"display-massive": [
					"12vw",
					{ lineHeight: "1", letterSpacing: "0.05em" },
				],
				"display-xl": [
					"clamp(3rem, 8vw, 8rem)",
					{ lineHeight: "0.9", letterSpacing: "-0.02em" },
				],
				"display-lg": [
					"clamp(2.5rem, 6vw, 6rem)",
					{ lineHeight: "0.95", letterSpacing: "-0.02em" },
				],
				"display-md": [
					"clamp(2rem, 5vw, 4rem)",
					{ lineHeight: "1", letterSpacing: "-0.01em" },
				],
			},
			animation: {
				"fade-in":
					"fadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
				"fade-out":
					"fadeOut 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
				"slide-up":
					"slideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
				"slide-down":
					"slideDown 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
				"scale-in":
					"scaleIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
				"scale-out":
					"scaleOut 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				fadeOut: {
					"0%": { opacity: "1" },
					"100%": { opacity: "0" },
				},
				slideUp: {
					"0%": { opacity: "0", transform: "translateY(30px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
				slideDown: {
					"0%": { opacity: "0", transform: "translateY(-30px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
				scaleIn: {
					"0%": { opacity: "0", transform: "scale(0.95)" },
					"100%": { opacity: "1", transform: "scale(1)" },
				},
				scaleOut: {
					"0%": { opacity: "0", transform: "scale(1.05)" },
					"100%": { opacity: "1", transform: "scale(1)" },
				},
			},
			transitionTimingFunction: {
				"expo-in": "cubic-bezier(0.19, 1, 0.22, 1)",
				"expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
				"expo-in-out": "cubic-bezier(0.87, 0, 0.13, 1)",
				luxury: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
			},
			aspectRatio: {
				"2/3": "2 / 3",
				"3/4": "3 / 4",
				"4/5": "4 / 5",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
};
