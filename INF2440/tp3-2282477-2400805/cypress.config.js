import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "./tests/cypress/support/e2e.js",
    fixturesFolder: "./tests/cypress/fixtures",
    specPattern: "./tests/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}"
  },
  defaultCommandTimeout: 1000,
  video: false,
  projectId: "ad13fy"
});
