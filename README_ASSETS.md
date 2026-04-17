# Aether Sim Assets Guide

To truly "own" all resources and avoid external dependency errors, we have moved the application to use local asset paths.

## Directory Structure
- `public/assets/models/`: Place your `.glb` 3D models here.
- `public/assets/hdri/`: Place your `.hdr` environment maps here (currently using built-in presets).
- `public/assets/images/`: Place UI and preview images here.

## Required Files
For the simulation to look best, please add the following files to `public/assets/models/`:
1. `airplane.glb`: The main airliner model.
2. `arwing.glb`: The interceptor model (also used for AI traffic).
3. `scifi-ship.glb`: The transport model.

## Fallback System
The application is designed with a robust fallback system:
- **Procedural Models**: If a `.glb` file fails to load, the simulator will automatically render a simplified procedural airplane so the simulation remains playable.
- **Environment Presets**: Instead of relying on external HDRIs, we now use the high-quality built-in presets from `@react-three/drei` (`sunset` and `night`), which are more reliable.

## Why this change?
External assets stored on services like GitHub Raw can encounter `404 Not Found` or `403 Forbidden` errors if the repository structure changes or ratelimits are hit. By hosting assets locally in the `public/` directory, the application becomes self-contained and production-ready.
