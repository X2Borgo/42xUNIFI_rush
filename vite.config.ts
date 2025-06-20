import { defineConfig } from "vite";

export default defineConfig({
	root: "public",
	server: {
		port: 4269,
		host: "0.0.0.0",
		hmr: true,
		watch: {
			ignored: ["**/node_modules/**", "**/dist/**", "**.json"],
			usePolling: true,
		}
	},
	preview: {
		port: 4269,
		host: "0.0.0.0",
	},
	optimizeDeps: {
		exclude: [],
	},
	resolve: {
		alias: {
			"@": new URL("./", import.meta.url).pathname,
		},
	},
});
