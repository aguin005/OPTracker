export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  // hover: styles only apply where a real mouse can hover, so on phones they
  // don't stay stuck on after a tap.
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      fontFamily: {
        // Japanese gothic for everyday text, like the type in a printed volume.
        sans: ['"Zen Kaku Gothic New"', "system-ui", "sans-serif"],
        // Heavy gothic for titles, headings, and sound effects.
        display: ['"Dela Gothic One"', '"Zen Kaku Gothic New"', "system-ui", "sans-serif"],
        // Wanted-poster slab serif.
        poster: ['"Alfa Slab One"', "Georgia", "serif"],
        // Brush calligraphy for chapter labels and seals.
        brush: ['"Yuji Syuku"', '"Zen Kaku Gothic New"', "serif"],
      },
      colors: {
        ink: "#121212",
        paper: "#F3EEE4",
        sheet: "#FBF8F2",
        tone: "#8A8478",
        haki: { DEFAULT: "#D3122A", glow: "#FF2A3D" },
      },
    },
  },
  plugins: [],
};
