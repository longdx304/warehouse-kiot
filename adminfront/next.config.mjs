import withPWA from 'next-pwa';
import runtimeCaching from 'next-pwa/cache.js';

/** @type {import('next').NextConfig} */
const pwaConfig = {
	disable: false,
	dest: 'public',
	// disable: !isProduction,
	runtimeCaching,
	register: true,
	skipWaiting: true,
};

const nextConfig = {
	reactStrictMode: true,
	images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "dob-ecommerce.s3.ap-southeast-1.amazonaws.com",
      }
    ],
  },
	async redirects() {
		return [
			{
				source: '/',
				destination: '/admin/dashboard',
				permanent: false,
			},
		];
	},
};

export default withPWA(pwaConfig)(nextConfig);
