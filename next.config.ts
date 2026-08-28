import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  serverExternalPackages: ["pdfkit"],
  outputFileTracingIncludes: {
    "/api/reports/coin-requests/export-pdf": ["./node_modules/pdfkit/**/*"],
  },
};

export default nextConfig;
