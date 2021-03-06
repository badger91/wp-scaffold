const chalk = require('chalk');
const { Command } = require('commander');
const { readFile } = require('fs/promises');
const { kebabCase, snakeCase, startCase } = require('lodash');
const path = require('path');

const prompts = require('./plugin.prompts');
const scaffold = require('../utils/scaffold');

/**
 * Export the plugin scaffolding command.
 */
module.exports = () => new Command('plugin')
	.description('generate a folder and files for a basic plugin')
	.argument('<slug>', 'the (unique) plugin folder and textdomain', (slug) => {
		return kebabCase(slug);
	})
	.option('-y, --yes', 'automatically answer "yes" to any prompts', false)
	.action(async (slug, options) => {
		// Get package.json from working directory.
		let package = '{}'
		
		try {
			package = await readFile(path.resolve(process.cwd(), 'package.json'), 'utf-8');
			return contents;
		} catch(error) {}
		
		packageJson = JSON.parse(package);

		// Default values.
		let defaults = {
			name: startCase(slug),
			description: '',
			author: '',
			authorURI: packageJson?.homepage ?? '',
			pluginURI: packageJson?.repository?.url ?? packageJson?.homepage ?? '',
		};

		// If `--yes` option was passed, skip the wizard.
		let responses = options.yes ? {} : await prompts(defaults);

		// Create a PHP-valid string for use in PHP function names.
		let machineName = snakeCase(slug);

		// Data variables to be passed to the template.
		let vars = Object.assign({
			slug,
			machineName,
			textdomain: slug,
		}, defaults, responses);

		try {
			scaffold(path.resolve(__dirname, './plugin.template'), `${slug}`, vars);
		} catch(error) {
			console.log(chalk.red(error));
		}
	})
