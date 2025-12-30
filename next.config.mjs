// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   swcMinify: true,
//   images: {
//     domains: ['images.unsplash.com', 'avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
//   },
//   experimental: {
//     serverActions: true,
//   },
//   async headers() {
//     return [
//       {
//         source: '/:path*',
//         headers: [
//           {
//             key: 'X-DNS-Prefetch-Control',
//             value: 'on'
//           },
//           {
//             key: 'Strict-Transport-Security',
//             value: 'max-age=63072000; includeSubDomains; preload'
//           },
//           {
//             key: 'X-XSS-Protection',
//             value: '1; mode=block'
//           },
//           {
//             key: 'X-Frame-Options',
//             value: 'SAMEORIGIN'
//           },
//           {
//             key: 'X-Content-Type-Options',
//             value: 'nosniff'
//           },
//           {
//             key: 'Referrer-Policy',
//             value: 'origin-when-cross-origin'
//           }
//         ],
//       },
//     ]
//   },
//   async redirects() {
//     return [
//       {
//         source: '/admin',
//         destination: '/dashboard',
//         permanent: false,
//       },
//       {
//         source: '/login',
//         destination: '/auth/login',
//         permanent: true,
//       },
//       {
//         source: '/register',
//         destination: '/auth/register',
//         permanent: true,
//       },
//     ]
//   },
// }

// module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
