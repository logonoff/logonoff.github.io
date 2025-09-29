export default function (eleventyConfig) {
	// Output directory: _site

	// Copy `assets/` to `_site/assets`
	eleventyConfig.addPassthroughCopy("assets");

  // Copy `profile/` to `_site/profile`
	eleventyConfig.addPassthroughCopy("profile");

  // Copy `projects/` to `_site/projects`
	eleventyConfig.addPassthroughCopy("projects");
};
