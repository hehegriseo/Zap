# Zap

<p>
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue"/>
  <img alt="Status" src="https://img.shields.io/badge/status-early--development-yellow"/>
  <img alt="Rust" src="https://img.shields.io/badge/rust-1.70%2B-orange"/>
  <img alt="Node" src="https://img.shields.io/badge/node-20%2B-green"/>
</p>

**A modern, PipeWire-native, open-source soundboard for Linux.**

Zap lets you play sounds through a virtual microphone — visible to Discord, OBS, Minecraft, and any other app. Built with **Tauri**, **React**, and **Rust** for low-latency, native performance.

> 🚧 **Early Development** — Built by [Vishal](https://github.com/vishal). Features are actively being built. Expect breaking changes.

---

## Demo

<!-- TODO: Add screenshot or screen recording -->
<p align="center">
  <i>Screenshot coming soon.</i>
</p>

---

## Features

| Capability | Description |
|---|---|
| 🎛️ **PipeWire Native** | Direct integration with PipeWire for low-latency audio routing |
| 🎤 **Virtual Microphone** | Creates a virtual mic — works with Discord, OBS, Minecraft, Zoom, and more |
| ⌨️ **Global Hotkeys** | Assign keyboard shortcuts to trigger sounds from anywhere |
| 📚 **Sound Library** | Organize sounds with collections, tags, and favorites |
| 👤 **Profile System** | Switch between setups for gaming, streaming, or work |
| 🔌 **Plugin System** | Extend functionality with audio effects and integrations |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Desktop Shell** | [Tauri](https://tauri.app) v2 |
| **Frontend** | React, TypeScript, Tailwind CSS, shadcn/ui, Zustand |
| **Backend** | Rust, workspaced crates |
| **Audio** | PipeWire, `libpulse` |
| **Persistence** | SQLite via `rusqlite` |
| **Packaging** | pnpm workspaces, Cargo workspace |

## Prerequisites

- **Linux** (Wayland or X11)
- **PipeWire** (with `libpipewire-0.3-dev`)
- **Rust 1.70+** — install via [rustup](https://rustup.rs/)
- **Node.js 20+** — [download](https://nodejs.org/)
- **pnpm** — `npm install -g pnpm`

## Quick Start

```bash
# Clone
git clone https://github.com/zap-soundboard/zap.git
cd zap

# Install dependencies
pnpm install

# Run in development mode (hot-reload)
cargo tauri dev

# Build for production
cargo tauri build
```

<details>
<summary><b>Ubuntu/Debian system dependencies</b></summary>

```bash
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libpipewire-0.3-dev
```
</details>

---

## Project Structure

```
zap/
├── apps/desktop/              # Tauri desktop app
│   ├── src/                   # React frontend (Vite + TypeScript)
│   └── src-tauri/             # Rust backend (Tauri commands)
├── crates/                    # Rust workspace crates
│   ├── shared/                # Common types, events, errors
│   ├── storage/               # SQLite persistence layer
│   ├── settings/              # Configuration management
│   ├── logging/               # Structured tracing
│   ├── audio-engine/          # Audio decoding & playback
│   ├── pipewire-manager/      # PipeWire session management
│   ├── virtual-mic/           # Virtual microphone source
│   ├── hotkeys/               # Global hotkey binding
│   ├── sound-library/         # Sound organization & tagging
│   └── plugins/               # Plugin system & SDK
├── packages/                  # Shared TypeScript packages
└── docs/                      # Additional documentation
```

---

## Status & Roadmap

- [x] Monorepo setup (pnpm + Cargo workspace)
- [x] Tauri v2 shell with React frontend
- [ ] Core audio engine (in progress)
- [ ] PipeWire virtual mic (in progress)
- [ ] Global hotkey subsystem
- [ ] Sound library with tagging/favorites
- [ ] Profile system
- [ ] Plugin SDK & loader
- [ ] First public release

---

## Documentation

| Document | Description |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Technical architecture & design decisions |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Environment setup & dev workflow |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Detailed directory layout |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

## License

MIT — see [LICENSE](LICENSE).
