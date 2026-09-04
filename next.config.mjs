/** @type {import('next').NextConfig} */
const nextConfig = {
  // PDFKit loads its built-in font metrics (Helvetica.afm, etc.) from its
  // package directory at runtime. Bundling it into .next/server rewrites that
  // path to vendor-chunks/data, where those non-JavaScript assets do not exist.
  serverExternalPackages: ['pdfkit'],
}

export default nextConfig
