import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// GitHub Pages 项目站点部署在 /<repo> 子路径下
const REPO = "content-workbench";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? `/${REPO}` : "",
  images: { unoptimized: true },
};

export default nextConfig;
