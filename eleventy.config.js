import { defineConfig } from '11ty.ts'; // i'm shocked we need this T_T

/**
 * naive way of minifying code by removing new lines and trimming spaces
 *
 * means you cannot use `//`, or multi-line strings :shrug:
 *
 * @param {string} code
 * @returns {string} propeller hat and comically large lollipop (due to naivety)
 */
const minify = code => code.split('\n').map(line => line.trim()).join('');

export default defineConfig(config => {
	// Output directory: _site

	/** Minify HTML */
	config.addTransform("minify", (content, outputPath) => {
		switch (outputPath ? outputPath.split('.').pop() : null) {
			case "html":
				return minify(content);
			default:
				return content;
		}
	});

	/** CSS minifier */
	config.addFilter("cssmin", minify);

	/** Passthrough copy (minification does not apply) */
	// Copy `assets/` to `_site/assets`
	config.addPassthroughCopy("assets");

	// Copy `projects/` to `_site/projects`
	config.addPassthroughCopy("projects");

	// copy static files root
	config.addPassthroughCopy(".well-known");
	config.addPassthroughCopy("favicon.ico");
	config.addPassthroughCopy("icons.svg");
	config.addPassthroughCopy("jason.json");
	config.addPassthroughCopy("robots.txt");
});
