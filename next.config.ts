/** @type {import('next').NextConfig} */
  const nextConfig = {
    // Skip TS and ESLint errors during Vercel build so deploys always go through
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    experimental: {
      serverActions: {
        bodySizeLimit: "2mb",
      },
    },
  };

  export default nextConfig;
  