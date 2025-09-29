const { defineConfig } = require('11ty.ts'); // i'm shocked we need this T_T

export default defineConfig(config => {
	// Output directory: _site

	/** Passthrough Copy **/
	// Copy `assets/` to `_site/assets`
	config.addPassthroughCopy("assets");

	// Copy `profile/` to `_site/profile`
	config.addPassthroughCopy("profile");

	// Copy `projects/` to `_site/projects`
	config.addPassthroughCopy("projects");
});
