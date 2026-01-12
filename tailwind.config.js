/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Menambahkan warna identitas Kabupaten Bogor (Hijau/Kuning)
        primary: "#1b5e20", // Contoh Hijau DLH
        secondary: "#fbc02d", // Contoh Kuning
      },
    },
  },
  plugins: [],
}