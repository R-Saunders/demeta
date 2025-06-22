/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push(
        '@ffmpeg-installer/ffmpeg',
        '@ffprobe-installer/ffprobe',
        'fluent-ffmpeg'
      );
    }
    return config;
  },
};

module.exports = nextConfig;
