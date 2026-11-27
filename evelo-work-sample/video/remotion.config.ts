import { Config } from "@remotion/cli/config";

// Entry point (registerRoot) for `remotion render`, `remotion still` and `remotion studio`.
Config.setEntryPoint("./remotion/index.ts");

// --- Headless 3D on a GPU-less cloud container -------------------------------------------
// Use the preinstalled Chromium headless shell. Setting an executable stops Remotion from
// trying to download its own browser (no download host is reachable from this container).
// This path is a wrapper script in front of chrome-headless-shell.real. The wrapper strips
// --use-gl=angle / --use-gl=swiftshader / --use-angle=swiftshader, so --gl=swangle, angle and
// swiftshader all end up as the same launch: WebGL on ANGLE -> Vulkan -> SwiftShader (CPU).
Config.setBrowserExecutable(
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell",
);

// The right setting for a machine without a GPU (and the one that works off this container).
// --gl=egl fails here ("Requested GL implementation (gl=egl-gles2,angle=none) not found").
Config.setChromiumOpenGlRenderer("swangle");

// Opt in to software WebGL explicitly. Without it Chromium logs "Automatic fallback to software
// WebGL has been deprecated" and a future Chromium may refuse to create the WebGL context.
Config.setChromiumFlags({ "enable-unsafe-swiftshader": true });

// The wrapper reads this env var (Remotion spawns Chromium with process.env): it points the
// Vulkan loader at a faster SwiftShader build in /opt/swiftshader-llvm-fast. Same pixels,
// ~30% less time per frame in the smoke test. Harmless on machines without the wrapper.
process.env.CHROMIUM_WEBGL_RENDERER ??= "swiftshader-llvm-fast";

// 4 vCPUs here: concurrency 2 beat 1, 3 and 4 (SwiftShader already uses several threads).
Config.setConcurrency(2);

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(90);
Config.setOverwriteOutput(true);
