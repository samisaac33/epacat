import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@epacat/shared'],
  serverExternalPackages: ['@epacat/comercial'],
  outputFileTracingIncludes: {
    '/api/comercial/analisis': ['./data/**/*'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
