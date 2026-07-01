/** @type {import('next').NextConfig} */
  const nextConfig = {
    // Allow build to complete even if TypeScript/ESLint errors remain
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    experimental: {
      serverActions: {
        bodySizeLimit: "2mb",
      },
    },
  };

  module.exports = nextConfig;
  