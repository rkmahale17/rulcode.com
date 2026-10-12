import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer, dev }) => {
    // Note: Admin code exclusion is handled via conditional dynamic imports
    // in the respective page.tsx files. This ensures that in production
    // builds where BUILD_ADMIN is not set, the admin code is tree-shaken.
    return config;
  },
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    optimizePackageImports: [
      'date-fns',
      'lucide-react',
      'recharts',
      'framer-motion',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-aspect-ratio',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-label',
      '@radix-ui/react-menubar',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group',
      '@radix-ui/react-tooltip'
    ],
  },
  async redirects() {
    return [
      {
        source: '/dsa/get-started',
        destination: '/problems',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const rewrites = [
      {
        source: '/p/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/p/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ];

    if (process.env.NEXT_PUBLIC_API_URL) {
      rewrites.push({
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      });
    }

    return rewrites;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rulcode.com',
      },
    ],
  },
};

export default nextConfig;
