import { defineConfig } from 'cypress';

export default defineConfig({
	e2e: {
		setupNodeEvents(on, config) {
			// implement node event listeners here
		},
		baseUrl: 'http://localhost:3000',
		video: false,
	},
	component: {
		devServer: {
			framework: 'next',
			bundler: 'webpack',
		},
	},
	env: {
		test_email: 'admin@test.com',
		test_password: '123456',
	},
});
