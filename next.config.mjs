/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
		],
		formats: ["image/avif", "image/webp"],
	},
	experimental: {
		serverActions: {
			allowedOrigins: ["localhost:3000", "reselyra.mirazstudio.xyz"],
		},
	},
	async rewrites() {
		return [
			{
				// Serve legacy /uploads/filename paths via the new API route
				source: "/uploads/:filename",
				destination: "/api/media/file/:filename",
			},
		];
	},
};

export default nextConfig;
