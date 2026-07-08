import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/demo/**/*.{js,jsx,ts,tsx}",
    "./src/data/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "kiwi-green": "#A3E635",
        "kiwi-green-dark": "#84CC16",
        "kiwi-yellow": "#FDE047",
        "kiwi-light-green": "#ECFCCB",
        "kiwi-gray": "#E5E7EB",
        kiwi: {
          50: "#f6ffe5",
          100: "#ecfccb",
          300: "#bef264",
          400: "#a3e635",
          500: "#84cc16",
          700: "#4d7c0f",
          ink: "#102015"
        }
      },
      boxShadow: {
        soft: "0 18px 60px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: [forms]
};

export default config;
