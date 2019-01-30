const reporter = require('cucumber-html-reporter')

const options = {
  theme: 'bootstrap',
  jsonFile: 'build/reports/compatibility-report.json',
  output: 'build/reports/compatibility-report.html',
  reportSuiteAsScenarios: true,
  launchReport: false
}

reporter.generate(options)