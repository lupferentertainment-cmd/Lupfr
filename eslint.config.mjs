import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
      "@next/next/no-img-element": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    ".next-ci/**",
    "out/**",
    "build/**",
    "coverage/**",
    "node_modules/**",
    "_deprecated/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
