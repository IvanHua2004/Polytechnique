const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) { },
    excludeSpecPattern: "shared.js",
    supportFile: false
  },
  defaultCommandTimeout: 1000,
  video: false,
  viewportHeight: 1000,
  viewportWidth: 1600,
  projectId: "jxcynk",
});