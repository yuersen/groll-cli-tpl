/**
 * eslint
 */
const {
  CLIEngine
} = require('eslint');
const {
  createFilter
} = require('rollup-pluginutils');
const path = require('path');

module.exports = function eslint(options, useEslint) {
  const cli = new CLIEngine(options);
  let formatter = options.formatter;

  if (!useEslint) {
    return {
      name: 'eslint',
      transform(code, id) {
        return null;
      }
    };
  }

  if (typeof formatter !== 'function') {
    formatter = cli.getFormatter(formatter || 'stylish');
  }

  const filter = createFilter(
    options.include,
    options.exclude || /node_modules/
  );
  const normalizePath = function (id) {
    return path.relative(process.cwd(), id).split(path.sep).join('/');
  };
  return {
    name: 'eslint',
    transform(code, id) {
      const file = normalizePath(id);
      const report = cli.executeOnText(code, file);
      const result = formatter(report.results);
      const hasWarnings = options.throwOnWarning && report.warningCount !== 0;
      const hasErrors = options.throwOnError && report.errorCount !== 0;

      if (cli.isPathIgnored(file) || !filter(id)) {
        return null;
      }
      if (report.warningCount === 0 && report.errorCount === 0) {
        return null;
      }
      if (result) {
        console.log(result);
      }
      if (hasWarnings && hasErrors) {
        throw Error('Warnings or errors were found');
      }
      if (hasWarnings) {
        throw Error('Warnings were found');
      }
      if (hasErrors) {
        throw Error('Errors were found');
      }
    }
  };
}
