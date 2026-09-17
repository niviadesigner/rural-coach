/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ruralcycle.cc" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  // La app se sirve embebida en ruralcycle.cc — permitimos el frame del dominio padre.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://ruralcycle.cc https://*.ruralcycle.cc",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
