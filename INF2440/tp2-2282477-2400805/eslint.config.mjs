import js from "@eslint/js";
import globals from "globals";
import jestPlugin from "eslint-plugin-jest"
import { defineConfig, globalIgnores } from "eslint/config";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: { ...globals.browser, ...jestPlugin.environments.globals.globals } } },
  {
    rules: {
      "eqeqeq": "error",
      "max-lines": ["error", { max: 200, skipBlankLines: true, skipComments: true }],
      "no-unused-vars": "error",
      "no-var": "error",
      "no-console": "warn",
      "prefer-const": "error",
      "no-magic-numbers": ["error", { ignore: [0, 1, 2, 3, 4, 5], ignoreArrayIndexes: true, detectObjects: true }],
    }
  },
  globalIgnores(["node_modules", "dist", "eslint.config.mjs",])
]);
