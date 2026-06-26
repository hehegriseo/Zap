# Zap

A modern, PipeWire-native, open-source soundboard for Linux.

## Features

- **PipeWire Native** — Direct integration with PipeWire for low-latency audio routing
- **Virtual Microphone** — Creates a virtual mic visible to Discord, OBS, Minecraft, and more
- **Global Hotkeys** — Assign keyboard shortcuts to trigger sounds from anywhere
- **Sound Library** — Organize sounds with collections, tags, and favorites
- **Profile System** — Switch between different setups for gaming, streaming, or work
- **Plugin System** — Extend functionality with audio effects and integrations

## Installation

### Build from Source

```bash
# Clone the repository
git clone https://github.com/zap-soundboard/zap.git
cd zap

# Install dependencies
pnpm install

# Run in development mode
cargo tauri dev

# Build for production
cargo tauri build
```

### System Requirements

- Linux (Wayland or X11)
- PipeWire
- Rust 1.70+
- Node.js 20+

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for setup instructions.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the technical architecture.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

MIT License — see [LICENSE](LICENSE) for details.
