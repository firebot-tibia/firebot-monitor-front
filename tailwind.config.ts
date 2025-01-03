// tailwind.config.js
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'dark-gradient': 'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)',
      },
      colors: {
        white: '#ffffff',
      },
    },
  },
  plugins: [],
}

export default config
