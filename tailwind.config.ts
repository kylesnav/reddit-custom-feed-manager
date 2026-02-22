import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        reddit: {
          orange: '#FF4500',
          blue: '#0079D3',
          lightblue: '#24A0ED',
          darkbg: '#1A1A1B',
          lightbg: '#FFFFFF',
          gray: {
            100: '#F6F7F8',
            200: '#EDEFF1',
            300: '#D7DADC',
            400: '#C8CBCD',
            500: '#878A8C',
            600: '#576064',
            700: '#373C3F',
            800: '#272729',
            900: '#1A1A1B',
          },
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
export default config