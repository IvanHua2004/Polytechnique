import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

export default defineConfig([
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  reactHooks.configs['recommended-latest'],
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    settings: { react: { version: "detect" } },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    rules: {
      "semi": ["error", "always"],
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "off",
    }
  },
]);
