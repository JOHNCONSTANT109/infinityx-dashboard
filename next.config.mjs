/** @type {import('next').NextConfig} */
  const nextConfig = {
    // Increase serverless function timeout so slow MongoDB cold starts
    // don't cause ERR_TIMED_OUT in the browser (max 30s on Vercel Hobby).
    experimental: {
      serverActions: {
        bodySizeLimit: "2mb",
      },
    },
  };

  export default nextConfig;
  