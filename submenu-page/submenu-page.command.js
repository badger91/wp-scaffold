const { Command } = require('commander');
const { kebabCase, snakeCase, startCase } = require('lodash');
const path = require('path');

const { getMenuPageSlug } = require('../menu-page/menu-page.utils');
const prompts = require('./submenu-page.prompts');
const scaffold = require('../utils/scaffold');

/**
 * Export the submenu-page scaffolding command.
 */
module.exports = () => new Command('submenu-page')
	.description('generate PHP for an admin submenu page')
	.argument('<slug>', 'the unique identifier for the menu item', (slug) => {
		// Remove non-lowercase alphanumerics. Allow hyphens and underscores.
		return slug.toLowerCase().replace(/[^a-z\-_\d]/g, '');
	})
	.argument('[parentSlug]', 'the parent menu item slug')
	.option('-y, --yes', 'automatically answer "yes" to any prompts', false)
	.action(async (slug, parentSlug, options) => {
		// Current plugin folder name.
		let plugin = path.basename(process.cwd());

		// Default values.
		let defaults = {
			textdomain: kebabCase(plugin),

			/**
			 * @see https://developer.wordpress.org/reference/functions/add_submenu_page/
			 */
			parentSlug: parentSlug ? await getMenuPageSlug(parentSlug) : '',
			pageTitle: startCase(slug),
			menuTitle: startCase(slug),
		};

		// If `--yes` option was passed, skip the wizard.
		let responses = options.yes ? {} : await prompts(defaults);

		// Create a PHP-valid string for use in PHP function names.
		let pluginMachineName = snakeCase(plugin);
		let machineName = snakeCase(slug);

		// Data variables to be passed to the template.
		let vars = Object.assign({
			slug,
			pluginMachineName,
			machineName,
		}, defaults, responses);

		try {
			scaffold(path.resolve(__dirname, './submenu-page.template.php.ejs'), `submenu-pages/${slug}.php`, vars);
		} catch(error) {}
	})