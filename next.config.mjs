/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  agentRules: false,
  turbopack: { root: process.cwd() },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'media.giphy.com' }],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'samepage.verttra.xyz' }],
        destination: 'https://same-page.verttra.xyz/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
