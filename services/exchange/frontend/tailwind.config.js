// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // ...
  ],
  plugins: [
    require('daisyui'),
  ],

  // DaisyUI-Konfiguration
  daisyui: {
    // 1. Nur die Themes auflisten, die Sie wirklich brauchen.
    //    Das erste Theme ("halloween") wird als Standard (hell) verwendet.
    themes: ["halloween", "dark"],
    
    // 2. Explizit festlegen, dass "dark" das Theme für 
    //    (prefers-color-scheme: dark) sein soll.
    darkTheme: "dark", 
  },
}