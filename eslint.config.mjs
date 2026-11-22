import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "@next/eslint-plugin-next";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const eslintConfig = defineConfig([
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,mts}"],
    plugins: {
      "@next/next": nextVitals,
      "@typescript-eslint": tsPlugin
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    rules: {
      ...nextVitals.configs.recommended.rules,
      ...nextVitals.configs["core-web-vitals"].rules,
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "warn"
    }
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"])
]);

export default eslintConfig;
