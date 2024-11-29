/** @type {import('tailwindcss').Config} */

export default {
  darkMode:'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        'recursive': ['Recursive'],
        'epilogue': ['Epilogue'],
        'jakarta': ['Jakarta'],
      },
      colors:{
        primarycolor:'#478CF7',
        bgcolor:'#EEFAFF',
        darkmodebg:'#070F2B',
        primarycardsbg:'#070F2B',
      }
    },
  },
  plugins: [
    require('daisyui'),
  ],
}

