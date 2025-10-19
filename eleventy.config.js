import { defineConfig } from '11ty.ts'; // i'm shocked we need this T_T
import htmlmin from "html-minifier";

export default defineConfig(config => {
	// Output directory: _site

	/** Minify HTML */
	config.addTransform("minify", (content, outputPath) => {
		switch (outputPath ? outputPath.split('.').pop() : null) {
			case "html":
				return htmlmin.minify(content, {
					removeComments: true,
					collapseWhitespace: true,
				});
			default:
				return content;
		}
	});

	/** Passthrough Copy **/
	// Copy `assets/` to `_site/assets`
	config.addPassthroughCopy("assets");

	// Copy `profile/` to `_site/profile`
	config.addPassthroughCopy("profile");

	// Copy `projects/` to `_site/projects`
	config.addPassthroughCopy("projects");

	// copy static files root
	config.addPassthroughCopy(".well-known");
	config.addPassthroughCopy("favicon.ico");
	config.addPassthroughCopy("jason.json");
	config.addPassthroughCopy("robots.txt");
});
