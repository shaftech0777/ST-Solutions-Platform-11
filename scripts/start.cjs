const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");

const distDir = path.join(process.cwd(), "dist");
const serverBundle = path.join(distDir, "server.cjs");

if (!fs.existsSync(serverBundle)) {
  console.log("[STARTUP] dist/server.cjs not found. Automatically compiling server bundle on Render...");
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  try {
    execSync(
      "npx esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
      { stdio: "inherit" }
    );
    console.log("[STARTUP] Server bundle compiled successfully.");
  } catch (err) {
    console.warn("[STARTUP WARN] esbuild bundling failed, falling back to direct tsx runner:", err.message);
    const child = spawn("npx", ["tsx", "server.ts"], { stdio: "inherit" });
    child.on("exit", (code) => process.exit(code || 0));
    return;
  }
}

// Execute the compiled CommonJS server bundle
try {
  require(serverBundle);
} catch (err) {
  console.error("[STARTUP ERROR] Failed to run dist/server.cjs:", err);
  // Last-resort fallback to tsx
  const child = spawn("npx", ["tsx", "server.ts"], { stdio: "inherit" });
  child.on("exit", (code) => process.exit(code || 0));
}
