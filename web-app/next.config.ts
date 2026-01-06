/** @type {import('next').NextConfig} */
const nextConfig = {
  // Esta opción es necesaria para usar Docker con output reducido
  output: 'standalone', 
  
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
      // Si en el futuro despliegas a producción en supabase.co, añadirás esa regla aquí
    ],
  },
};

export default nextConfig;