# Development Guide

## Prerequisites

- **Rust** — Install via [rustup](https://rustup.rs/)
- **Node.js 20+** — [Download](https://nodejs.org/)
- **pnpm** — `npm install -g pnpm`
- **System dependencies** (Ubuntu/Debian):

```bash
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libpipewire-0.3-dev
```

## Quick Start

```bash
# Clone and install
git clone https://github.com/zap-soundboard/zap.git
cd zap
pnpm install

# Run in development mode
cargo tauri dev
```

## Project Structure

```
zap/
├── apps/desktop/          # Tauri desktop application
│   ├── src/               # React frontend
│   └── src-tauri/         # Rust backend
├── crates/                # Rust workspace crates
│   ├── shared/            # Common types
│   ├── storage/           # SQLite persistence
│   ├── settings/          # Configuration
│   ├── logging/           # Tracing setup
│   ├── audio-engine/      # Audio decoding/playback
│   ├── pipewire-manager/  # PipeWire integration
│   ├── virtual-mic/       # Virtual microphone
│   ├── hotkeys/           # Global hotkeys
│   ├── sound-library/     # Sound management
│   └── plugins/           # Plugin system
├── packages/              # Shared TypeScript packages
└── docs/                  # Documentation
```

## Commands

### Rust

```bash
# Check all crates
cargo check --workspace

# Run tests
cargo test --workspace

# Format code
cargo fmt

# Run clippy
cargo clippy --workspace -- -D warnings
```

### Frontend

```bash
# Install dependencies
pnpm install

# Type check
pnpm typecheck

# Lint
pnpm lint

# Run tests
pnpm test

# Build
pnpm build
```

### Tauri

```bash
# Development mode
cargo tauri dev

# Production build
cargo tauri build
```

## Testing

### Rust Tests

```bash
cargo test --workspace
```

### Frontend Tests

```bash
pnpm test
```

### Tauri Integration Tests

```bash
cargo tauri build
```

## Troubleshooting

### PipeWire not found

Ensure PipeWire is running:

```bash
pw-cli info 0
```

### Build fails

Check system dependencies are installed. See Prerequisites above.
