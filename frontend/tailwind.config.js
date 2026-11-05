export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Chunky anime title-card lettering for headings.
        title: ['"Luckiest Guy"', '"Alfa Slab One"', "system-ui", "sans-serif"],
        // Wanted-poster slab serif.
        poster: ['"Alfa Slab One"', "Georgia", "serif"],
        // Manga sound-effect lettering.
        sfx: ["Bangers", '"Luckiest Guy"', "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#2B1D0E",
        cream: "#FFF6DF",
        parchment: "#F3E3B5",
        straw: "#F4C430",
        luffy: "#E63946",
        sea: {
          600: "#1667A0",
          700: "#0F4C78",
          800: "#0B3A5E",
          900: "#062A45",
          950: "#041A2B",
        },
      },
    },
  },
  plugins: [],
};
