/** @type {import('next').NextConfig} */
const nextConfig = {
  // PDFKit loads its built-in AFM font files at runtime. Keeping it external
  // prevents Next.js from relocating the module without those data files.
  serverExternalPackages: ['pdfkit', 'pdf-parse', 'pdfjs-dist'],
}

export default nextConfig
