import type { NextConfig } from "next";

function supabaseHostname() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return undefined;
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

const hostname = supabaseHostname();

const nextConfig: NextConfig = {
  images: hostname
    ? {
        remotePatterns: [
          {
            protocol: "https",
            hostname,
            pathname: "/storage/v1/object/public/**",
          },
        ],
      }
    : undefined,
};

export default nextConfig;
