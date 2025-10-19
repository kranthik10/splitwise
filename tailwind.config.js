/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b3c7ff',
          400: '#7d9fff',
          500: '#4d7cff',
          600: '#2d5fff',
          700: '#1a47e0',
          800: '#1538b8',
          900: '#0f2a8f',
        },
      },
    },
  },
  plugins: [],
}
