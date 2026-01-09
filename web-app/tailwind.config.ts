// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  // ... resto de config
  plugins: [
    require('@tailwindcss/typography'),
    // ... otros plugins
  ],
};
export default config;
