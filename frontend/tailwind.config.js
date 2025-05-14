/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        discord: {
          primary: '#5865F2',
          green: '#57F287',
          yellow: '#FEE75C',
          fuchsia: '#EB459E',
          red: '#ED4245',
          'blurple-dark': '#4752C4',
          'bg-tertiary': '#202225',
          'bg-secondary': '#2f3136',
          'bg-primary': '#36393f',
          'bg-modifier': '#4f545c',
          'text-normal': '#dcddde',
          'text-muted': '#a3a6aa',
          'text-link': '#00aff4',
          'header-primary': '#ffffff',
          'header-secondary': '#b9bbbe',
          'interactive-normal': '#b9bbbe',
          'interactive-hover': '#dcddde',
          'interactive-active': '#ffffff',
        },
      },
    },
  },
  plugins: [],
}