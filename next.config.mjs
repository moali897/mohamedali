/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/media/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/media/hls/:slug/:file*.m3u8',
        headers: [{ key: 'Content-Type', value: 'application/vnd.apple.mpegurl' }],
      },
      {
        source: '/media/hls/:slug/:file*.m4s',
        headers: [{ key: 'Content-Type', value: 'video/iso.segment' }],
      },
    ];
  },
};

export default nextConfig;
