import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Functions must not bundle the uploaded module attachments: Next's file
  // tracing sees the dynamic fs reads in lib/content.ts and pulls in broad
  // directories, which dragged all of public/uploads (~0.5 GB of rehosted
  // PDFs) into the api/download function — blowing Vercel's 300 MB function
  // limit and failing every deployment. Static files in public/ are served
  // by Vercel's CDN layer directly and are never read by function code.
  outputFileTracingExcludes: {
    "*": ["./public/uploads/**"],
  },
};

export default nextConfig;
