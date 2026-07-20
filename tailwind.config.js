/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    borderRadius: {
      none: '0px',
      xs: '0px',
      sm: '0px',
      DEFAULT: '0px',
      md: '0px',
      lg: '0px',
      xl: '0px',
      '2xl': '0px',
      '3xl': '0px',
      full: '9999px',
    },
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      colors: {
        // Menambahkan warna identitas Kabupaten Bogor (Hijau/Kuning)
        primary: "#1b5e20", // Contoh Hijau DLH
        secondary: "#fbc02d", // Contoh Kuning
      },
    },
  },
  plugins: [],
}