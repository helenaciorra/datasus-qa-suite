const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://datasus.saude.gov.br',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
  },
})