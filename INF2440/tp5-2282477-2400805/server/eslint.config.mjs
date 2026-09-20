import globals from "globals";
import pluginJs from "@eslint/js";
import jestPlugin from "eslint-plugin-jest";

export default [
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { ignores: ["eslint.config.mjs","coverage/**/*.js"] },
  { languageOptions: { globals: { ...globals.browser, ...jestPlugin.environments.globals.globals, ...globals.node } } },
  pluginJs.configs.recommended,
  {
    rules: {
      "no-magic-numbers": [
        "error",
        {
          "ignore": [
            0,
            1,
            2,
            3,
            -1
          ]
        }
      ],
      "max-lines": [
        "error",
        350
      ],
      "no-unneeded-ternary": [
        "error",
        {
          "defaultAssignment": false
        }
      ],
      "no-const-assign": "error",
      "no-console": "error",
      "no-unused-vars": "error",
      "no-undef": "error",
      "eqeqeq": "error",
      "comma-style": "error",
      "semi": 1,
    }
  }
];