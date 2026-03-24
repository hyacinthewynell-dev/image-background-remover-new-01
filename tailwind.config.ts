import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#060b18",
          panel: "rgba(8,20,40,0.8)",
          border: "rgba(0,170,255,0.15)",
          accent: "#00aaff",
          "accent-dark": "#0066ff",
          cyan: "#00d4ff",
          muted: "#4a6a8a",
          text: "#c8d6e5",
          "text-dim": "#6a9fcf",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "PingFang SC", "Microsoft YaHei", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
