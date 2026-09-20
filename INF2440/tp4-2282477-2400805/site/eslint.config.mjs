import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs}"],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: { globals: globals.browser },
    },
    {
        rules: {
            eqeqeq: "error",
            "max-lines": [
                "error",
                { max: 200, skipBlankLines: true, skipComments: true },
            ],
            "no-unused-vars": "error",
            "no-var": "error",
            "no-console": "warn",
            "prefer-const": "error",
            "no-magic-numbers": [
                "error",
                {
                    ignore: [-1, 0, 1, 2, 3, 4, 5],
                    ignoreArrayIndexes: true,
                    detectObjects: true,
                },
            ],
        },
    },
    {
        ignores: ["node_modules", "eslint.config.mjs", "**/consts.js"],
    },
]);
