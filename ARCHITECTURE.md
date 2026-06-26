# Zap Architecture

A modern, open-source, PipeWire-native soundboard for Linux.

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Folder Structure](#2-folder-structure)
3. [Dependency Graph](#3-dependency-graph)
4. [Module Responsibilities](#4-module-responsibilities)
5. [Audio Engine](#5-audio-engine)
6. [PipeWire Integration](#6-pipewire-integration)
7. [Virtual Microphone](#7-virtual-microphone)
8. [Hotkey Subsystem](#8-hotkey-subsystem)
9. [UI Architecture](#9-ui-architecture)
10. [Sound Library](#10-sound-library)
11. [Settings System](#11-settings-system)
12. [Plugin System](#12-plugin-system)
13. [Logging](#13-logging)
14. [Error Handling](#14-error-handling)
15. [Security](#15-security)
16. [Performance](#16-performance)
17. [Testing Strategy](#17-testing-strategy)
18. [Packaging](#18-packaging)
19. [Documentation](#19-documentation)
20. [Implementation Roadmap](#20-implementation-roadmap)
21. [Coding Rules](#21-coding-rules)
22. [Risks and Tradeoffs](#22-risks-and-tradeoffs)
23. [Technology Decisions](#23-technology-decisions)

---

## 1. High-Level Architecture

### Architecture Pattern

Zap uses a **monorepo with workspace crates** pattern. The Tauri application shell hosts the React frontend and the Rust backend. Business logic lives in standalone crates under `crates/`, independent of Tauri. The Tauri layer is a thin adapter that bridges the frontend IPC to the crate APIs.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Tauri Shell                              │
│  ┌───────────────────────────┐  ┌────────────────────────────┐ │
│  │    React Frontend         │  │    Rust Backend             │ │
│  │    (TypeScript)           │  │    (Tauri Commands)         │ │
│  │                           │  │                             │ │
│  │  ┌─────────────────────┐  │  │  ┌──────────────────────┐  │ │
│  │  │  Zustand Store      │  │  │  │  Tauri Commands      │  │ │
│  │  │  (Client State)     │◄─┼──┼─►│  (IPC Adapter)       │  │ │
│  │  └─────────────────────┘  │  │  └──────────┬───────────┘  │ │
│  │  ┌─────────────────────┐  │  │             │              │ │
│  │  │  TanStack Query     │  │  │  ┌──────────▼───────────┐  │ │
│  │  │  (Server State)     │◄─┼──┼─►│  Application Core    │  │ │
│  │  └─────────────────────┘  │  │  │  (Orchestration)     │  │ │
│  │  ┌─────────────────────┐  │  │  └──────────┬───────────┘  │ │
│  │  │  React Router       │  │  │             │              │ │
│  │  │  (Navigation)       │  │  │  ┌──────────▼───────────┐  │ │
│  │  └─────────────────────┘  │  │  │  Workspace Crates    │  │ │
│  │  ┌─────────────────────┐  │  │  │                      │  │ │
│  │  │  Framer Motion      │  │  │  │  audio-engine        │  │ │
│  │  │  (Animations)       │  │  │  │  pipewire-manager    │  │ │
│  │  └─────────────────────┘  │  │  │  virtual-mic         │  │ │
│  │                           │  │  │  hotkeys             │  │ │
│  │  ┌─────────────────────┐  │  │  │  sound-library       │  │ │
│  │  │  shadcn/ui          │  │  │  │  storage             │  │ │
│  │  │  (Components)       │  │  │  │  settings            │  │ │
│  │  └─────────────────────┘  │  │  │  logging             │  │ │
│  │                           │  │  │  shared              │  │ │
│  └───────────────────────────┘  │  │  plugins             │  │ │
│                                 │  └──────────────────────┘  │ │
│                                 └────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Responsibility | Technology |
|-------|---------------|------------|
| **Frontend** | UI rendering, user interaction, client-side state | React, TypeScript, TailwindCSS, shadcn/ui, Zustand |
| **Tauri Commands** | IPC bridge, parameter validation, error serialization | Tauri v2, serde |
| **Application Core** | Orchestration, lifecycle management, event routing | Rust, tokio |
| **Workspace Crates** | Business logic, domain models, platform integration | Rust |

### Design Principles

1. **Crates are independent** -- No crate depends on Tauri. They can be tested, reused, or replaced without touching the UI.
2. **Frontend never contains business logic** -- All audio, file, and device operations go through Tauri commands.
3. **Error propagation is structured** -- Each crate defines its own error types. Tauri commands convert them to serializable errors.
4. **State is managed at the crate level** -- Tauri state wrappers hold crate types. Commands access state through dependency injection.

---

## 2. Folder Structure

```
zap/
├── apps/
│   └── desktop/                    # Tauri desktop application
│       ├── src/                    # React frontend source
│       │   ├── components/         # Reusable UI components
│       │   │   ├── ui/             # shadcn/ui base components
│       │   │   ├── layout/         # App shell, sidebar, header
│       │   │   ├── library/        # Sound library components
│       │   │   ├── player/         # Playback controls, waveform
│       │   │   ├── settings/       # Settings form components
│       │   │   └── common/         # Shared utilities (toasts, modals)
│       │   ├── pages/              # Route-level components
│       │   │   ├── Dashboard.tsx
│       │   │   ├── Library.tsx
│       │   │   ├── Settings.tsx
│       │   │   ├── Devices.tsx
│       │   │   ├── Hotkeys.tsx
│       │   │   ├── Logs.tsx
│       │   │   └── About.tsx
│       │   ├── hooks/              # Custom React hooks
│       │   │   ├── useSounds.ts
│       │   │   ├── usePlayback.ts
│       │   │   ├── useHotkeys.ts
│       │   │   ├── useSettings.ts
│       │   │   └── useDevices.ts
│       │   ├── stores/             # Zustand stores
│       │   │   ├── playerStore.ts
│       │   │   ├── libraryStore.ts
│       │   │   └── uiStore.ts
│       │   ├── lib/                # Utilities, API wrappers
│       │   │   ├── tauri.ts        # Typed invoke wrappers
│       │   │   ├── events.ts       # Event name constants
│       │   │   └── utils.ts
│       │   ├── types/              # TypeScript type definitions
│       │   │   └── index.ts
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       └── src-tauri/              # Tauri Rust backend
│           ├── Cargo.toml
│           ├── tauri.conf.json
│           ├── capabilities/
│           │   ├── default.json
│           │   └── tray.json
│           ├── icons/
│           └── src/
│               ├── main.rs
│               ├── lib.rs          # Builder, plugin registration
│               ├── commands/       # Tauri command modules
│               │   ├── mod.rs
│               │   ├── audio.rs
│               │   ├── library.rs
│               │   ├── devices.rs
│               │   ├── hotkeys.rs
│               │   ├── settings.rs
│               │   └── system.rs
│               ├── state.rs        # Managed state types
│               ├── errors.rs       # Tauri-specific error types
│               └── events.rs       # Event emission helpers
│
├── crates/                         # Rust workspace crates
│   ├── audio-engine/               # Audio decoding, mixing, playback
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── decoder.rs          # Format decoding (Symphonia)
│   │       ├── mixer.rs            # Multi-channel mixing
│   │       ├── player.rs           # Playback state machine
│   │       ├── buffer.rs           # Ring buffer, pre-decoded cache
│   │       ├── normalization.rs    # LUFS/volume normalization
│   │       └── error.rs
│   │
│   ├── pipewire-manager/           # PipeWire lifecycle management
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── context.rs          # PipeWire init, connection
│   │       ├── devices.rs          # Device enumeration
│   │       ├── nodes.rs            # Virtual node creation
│   │       ├── links.rs            # Port linking
│   │       ├── stream.rs           # Stream management
│   │       ├── monitor.rs          # Graph monitoring
│   │       └── error.rs
│   │
│   ├── virtual-mic/                # Virtual microphone abstraction
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── provider.rs         # Virtual mic provider trait
│   │       ├── pipewire.rs         # PipeWire implementation
│   │       ├── pulseaudio.rs       # PulseAudio fallback
│   │       ├── mixer.rs            # Mic + soundboard mixing
│   │       └── error.rs
│   │
│   ├── hotkeys/                    # Global hotkey system
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── manager.rs          # Hotkey registration/management
│   │       ├── backend.rs          # Backend trait (XDG, X11, evdev)
│   │       ├── xdg_portal.rs       # XDG GlobalShortcuts portal
│   │       ├── x11.rs             # X11 backend (global-hotkey)
│   │       ├── evdev.rs           # evdev fallback
│   │       ├── conflict.rs        # Conflict detection
│   │       ├── bindings.rs        # Key binding models
│   │       └── error.rs
│   │
│   ├── sound-library/              # Sound organization and metadata
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── library.rs          # Library management
│   │       ├── collection.rs       # Sound collections/folders
│   │       ├── metadata.rs         # Audio metadata extraction
│   │       ├── tags.rs             # Tag system
│   │       ├── search.rs           # Search and filtering
│   │       ├── favorites.rs        # Favorites management
│   │       ├── waveform.rs         # Waveform peak generation
│   │       └── error.rs
│   │
│   ├── storage/                    # Persistence layer
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── database.rs         # SQLite connection/pool
│   │       ├── migrations.rs       # Schema migrations
│   │       ├── models.rs           # Database models
│   │       ├── repository.rs       # Repository pattern
│   │       └── error.rs
│   │
│   ├── settings/                   # Configuration management
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── config.rs           # Configuration model
│   │       ├── profiles.rs         # Profile management
│   │       ├── themes.rs           # Theme definitions
│   │       ├── io.rs               # Config file I/O
│   │       ├── migration.rs        # Config version migration
│   │       └── error.rs
│   │
│   ├── logging/                    # Structured logging
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── subscriber.rs       # tracing subscriber setup
│   │       ├── file.rs             # File logging with rotation
│   │       ├── audio.rs            # Audio-specific logging
│   │       ├── pipewire.rs         # PipeWire-specific logging
│   │       └── error.rs
│   │
│   ├── shared/                     # Shared types and utilities
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── types.rs            # Common type definitions
│   │       ├── events.rs           # Event type definitions
│   │       ├── commands.rs         # Command type definitions
│   │       ├── errors.rs           # Shared error types
│   │       └── utils.rs            # Utility functions
│   │
│   └── plugins/                    # Plugin system (Phase 2+)
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs
│           ├── manager.rs          # Plugin lifecycle
│           ├── api.rs              # Plugin API surface
│           ├── loader.rs           # Dynamic library loading
│           ├── sandbox.rs          # Plugin sandboxing
│           └── error.rs
│
├── packages/                       # Shared TypeScript packages
│   ├── shared/                     # Shared types between frontend and backend
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── types.ts            # Shared TypeScript types
│   │       ├── events.ts           # Event name constants
│   │       └── constants.ts        # Application constants
│   └── ui/                         # Shared UI component library (future)
│       ├── package.json
│       └── src/
│           └── components/
│
├── docs/                           # Documentation
│   ├── architecture.md             # This file
│   ├── developer-guide.md
│   ├── plugin-guide.md
│   ├── packaging-guide.md
│   └── api/
│       ├── audio-engine.md
│       ├── pipewire.md
│       └── hotkeys.md
│
├── scripts/                        # Build and development scripts
│   ├── build.sh
│   ├── dev.sh
│   ├── package.sh
│   └── release.sh
│
├── assets/                         # Static assets
│   ├── icons/
│   ├── images/
│   └── sounds/                     # Default notification sounds
│
├── .github/                        # GitHub configuration
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── release.yml
│   │   └── nightly.yml
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
│
├── Cargo.toml                      # Workspace root
├── package.json                    # Workspace root (pnpm/yarn)
├── pnpm-workspace.yaml
├── .gitignore
├── .editorconfig
├── LICENSE
└── README.md
```

### Folder Explanations

| Folder | Purpose |
|--------|---------|
| `apps/desktop/` | The Tauri desktop application. Contains both the React frontend (`src/`) and the Tauri Rust backend (`src-tauri/`). This is the only deployable artifact. |
| `apps/desktop/src-tauri/` | Tauri shell. Thin adapter layer. Contains commands, state management, and plugin registration. No business logic. |
| `crates/audio-engine/` | Decodes audio files, manages playback state, handles mixing and normalization. Independent of PipeWire and Tauri. |
| `crates/pipewire-manager/` | Manages PipeWire connection, virtual devices, and graph monitoring. Wraps `pipewire-rs` with a safe, ergonomic API. |
| `crates/virtual-mic/` | Abstracts virtual microphone creation. Supports PipeWire native and PulseAudio fallback. Handles mic + soundboard mixing. |
| `crates/hotkeys/` | Global hotkey system with multiple backends (XDG portal, X11, evdev). Handles conflict detection and key binding persistence. |
| `crates/sound-library/` | Manages sound collections, metadata extraction, search, tags, favorites, and waveform generation. |
| `crates/storage/` | SQLite persistence layer with migration support. Stores sound metadata, settings, and application state. |
| `crates/settings/` | Configuration management with profiles, themes, import/export, and version migration. |
| `crates/logging/` | Structured logging with `tracing`. File rotation, audio event logging, and PipeWire debugging. |
| `crates/shared/` | Types shared between crates and the Tauri layer. Event definitions, command types, error types. |
| `crates/plugins/` | Plugin system for extending functionality. Dynamic loading, sandboxing, and API surface definition. |
| `packages/shared/` | TypeScript types shared between frontend and backend. Ensures type safety across the IPC boundary. |
| `docs/` | Project documentation. Architecture, developer guide, plugin API, and packaging instructions. |
| `scripts/` | Build, development, and release automation scripts. |
| `assets/` | Static resources: icons, images, default sounds. |
| `.github/` | CI/CD workflows, issue templates, PR templates. |

---

## 3. Dependency Graph

```
                    ┌─────────────┐
                    │  Tauri App  │
                    │  (lib.rs)   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ commands/ │ │  state   │ │  events  │
        └─────┬────┘ └─────┬────┘ └─────┬────┘
              │            │            │
              ▼            ▼            ▼
        ┌─────────────────────────────────────┐
        │           shared crate              │
        └─────────────────┬───────────────────┘
                          │
         ┌────────┬───────┼───────┬────────┐
         │        │       │       │        │
         ▼        ▼       ▼       ▼        ▼
   ┌──────────┐ ┌────┐ ┌─────┐ ┌─────┐ ┌──────┐
   │  audio-  │ │pip │ │virt │ │hot  │ │sound │
   │  engine  │ │wire│ │mic  │ │keys │ │lib   │
   └────┬─────┘ └──┬─┘ └──┬──┘ └──┬──┘ └──┬───┘
        │          │      │       │       │
        ▼          ▼      ▼       ▼       ▼
   ┌─────────────────────────────────────────┐
   │            storage crate                │
   └─────────────────────────────────────────┘
```

### Crate Dependencies

| Crate | Depends On |
|-------|-----------|
| `shared` | (none) |
| `storage` | `shared` |
| `settings` | `shared`, `storage` |
| `logging` | `shared` |
| `audio-engine` | `shared` |
| `pipewire-manager` | `shared` |
| `virtual-mic` | `pipewire-manager` |
| `hotkeys` | `shared` |
| `sound-library` | `shared`, `storage`, `audio-engine` |
| `plugins` | `shared` |
| `Tauri app` | all crates |

---

## 4. Module Responsibilities

### audio-engine

**Purpose:** Decode audio files, manage playback state, handle mixing and volume control.

**Public API surface:**

```rust
pub struct AudioEngine {
    pub fn new() -> Result<Self>;
    pub fn decode(&self, path: &Path) -> Result<DecodedAudio>;
    pub fn play(&self, id: SoundId, options: PlayOptions) -> Result<()>;
    pub fn stop(&self, id: SoundId) -> Result<()>;
    pub fn stop_all(&self) -> Result<()>;
    pub fn set_volume(&self, id: SoundId, volume: f32) -> Result<()>;
    pub fn master_volume(&self) -> f32;
    pub fn set_master_volume(&self, volume: f32);
    pub fn normalize(&self, audio: &mut DecodedAudio, target_lufs: f32);
}

pub struct DecodedAudio {
    pub samples: Vec<f32>,
    pub sample_rate: u32,
    pub channels: u16,
    pub duration: Duration,
    pub format: AudioFormat,
}

pub struct PlayOptions {
    pub volume: Option<f32>,
    pub fade_in: Option<Duration>,
    pub fade_out: Option<Duration>,
    pub loop_playback: bool,
    pub output_device: Option<String>,
}
```

**Key decisions:**
- Decode on import, not on play. Store pre-decoded PCM in memory for instant playback.
- Use Symphonia for all format decoding. Pure Rust, no C dependencies.
- Use cpal for audio output when playing to speakers (monitoring).
- PipeWire streaming is handled by `pipewire-manager`, not `audio-engine`.

### pipewire-manager

**Purpose:** Manage PipeWire connection, create virtual devices, monitor the audio graph.

**Public API surface:**

```rust
pub struct PipeWireManager {
    pub fn new() -> Result<Self>;
    pub fn connect(&mut self) -> Result<()>;
    pub fn disconnect(&mut self);
    pub fn is_connected(&self) -> bool;

    pub fn create_virtual_sink(&self, name: &str, description: &str) -> Result<VirtualSink>;
    pub fn create_virtual_source(&self, name: &str, description: &str) -> Result<VirtualSource>;
    pub fn link(&self, output_port: &Port, input_port: &Port) -> Result<Link>;
    pub fn unlink(&self, link: &Link) -> Result<()>;

    pub fn list_devices(&self) -> Result<Vec<AudioDevice>>;
    pub fn list_nodes(&self) -> Result<Vec<PipeWireNode>>;

    pub fn on_node_added(&self, callback: impl Fn(PipeWireNode) + 'static);
    pub fn on_node_removed(&self, callback: impl Fn(PipeWireNodeId) + 'static);
}

pub struct VirtualSink {
    pub id: NodeId,
    pub name: String,
    pub monitor_port: Port,
}

pub struct VirtualSource {
    pub id: NodeId,
    pub name: String,
    pub input_port: Port,
}
```

**Key decisions:**
- PipeWire operations run on a dedicated thread (PipeWire is not `Send`/`Sync`).
- Use `pipewire::channel` for cross-thread communication.
- Virtual devices use `object.linger = true` to survive app disconnection.
- Set `node.autoconnect = false` on virtual devices to prevent WirePlumber interference.

### virtual-mic

**Purpose:** Abstract virtual microphone creation across backends.

**Public API surface:**

```rust
pub trait VirtualMicProvider: Send + Sync {
    fn create(&self, config: VirtualMicConfig) -> Result<VirtualMic>;
    fn destroy(&self, mic: &VirtualMic) -> Result<()>;
    fn is_available(&self) -> bool;
    fn name(&self) -> &str;
}

pub struct VirtualMic {
    pub id: String,
    pub name: String,
    pub provider: String,
}

pub struct VirtualMicConfig {
    pub name: String,
    pub description: String,
    pub mix_with_real_mic: bool,
    pub real_mic_device: Option<String>,
}
```

**Key decisions:**
- PipeWire is the primary provider. PulseAudio is a fallback for legacy systems.
- The virtual mic mixes decoded audio from `audio-engine` with the real microphone (optional).
- Supports both PipeWire native (`pw-link`) and PulseAudio (`pactl`) for maximum compatibility.

### hotkeys

**Purpose:** Global hotkey registration, conflict detection, and key binding management.

**Public API surface:**

```rust
pub struct HotkeyManager {
    pub fn new() -> Result<Self>;
    pub fn register(&mut self, binding: KeyBinding) -> Result<HotkeyId>;
    pub fn unregister(&mut self, id: HotkeyId) -> Result<()>;
    pub fn update_binding(&mut self, id: HotkeyId, binding: KeyBinding) -> Result<()>;
    pub fn list_conflicts(&self, binding: &KeyBinding) -> Vec<HotkeyId>;
    pub fn on_event(&self, callback: impl Fn(HotkeyEvent) + 'static);
}

pub struct KeyBinding {
    pub key: Key,
    pub modifiers: Modifiers,
    pub action: HotkeyAction,
}

pub enum HotkeyAction {
    PlaySound(SoundId),
    StopAll,
    ToggleMute,
    PushToPlay(SoundId),
    Custom(String),
}

pub struct HotkeyEvent {
    pub id: HotkeyId,
    pub state: KeyState, // Pressed, Released
    pub timestamp: Instant,
}
```

**Key decisions:**
- Primary backend: XDG GlobalShortcuts Portal via `ashpd` (Wayland-native).
- Fallback: X11 via `global-hotkey` crate.
- Fallback: evdev raw input (requires `input` group membership).
- Conflict detection: Check all registered bindings before allowing new registration.
- Support both trigger (press to play) and push-to-play (hold to play, release to stop) modes.

### sound-library

**Purpose:** Manage sound collections, metadata, search, and organization.

**Public API surface:**

```rust
pub struct SoundLibrary {
    pub fn new(storage: Arc<Storage>) -> Result<Self>;
    pub fn add_folder(&self, path: &Path) -> Result<CollectionId>;
    pub fn remove_folder(&self, id: CollectionId) -> Result<()>;
    pub fn scan(&self, id: CollectionId) -> Result<Vec<SoundEntry>>;
    pub fn search(&self, query: &str) -> Result<Vec<SoundEntry>>;
    pub fn filter(&self, filter: SoundFilter) -> Result<Vec<SoundEntry>>;
    pub fn get(&self, id: SoundId) -> Result<SoundEntry>;
    pub fn add_tag(&self, id: SoundId, tag: &str) -> Result<()>;
    pub fn remove_tag(&self, id: SoundId, tag: &str) -> Result<()>;
    pub fn toggle_favorite(&self, id: SoundId) -> Result<bool>;
    pub fn get_waveform(&self, id: SoundId) -> Result<Vec<f32>>;
}

pub struct SoundEntry {
    pub id: SoundId,
    pub name: String,
    pub path: PathBuf,
    pub collection_id: CollectionId,
    pub duration: Duration,
    pub format: AudioFormat,
    pub sample_rate: u32,
    pub channels: u16,
    pub tags: Vec<String>,
    pub is_favorite: bool,
    pub volume: f32,
    pub normalized: bool,
    pub waveform_peaks: Option<Vec<f32>>,
    pub created_at: DateTime<Utc>,
}
```

### storage

**Purpose:** SQLite persistence with migration support.

**Key decisions:**
- Use `rusqlite` for direct SQLite access (no async ORM overhead for local DB).
- WAL mode for concurrent read/write.
- Schema migrations managed in-code (no external migration tool).
- Store decoded audio peaks in DB for fast waveform rendering.

### settings

**Purpose:** Application configuration with profiles.

**Public API surface:**

```rust
pub struct SettingsManager {
    pub fn new(path: &Path) -> Result<Self>;
    pub fn load(&mut self) -> Result<Config>;
    pub fn save(&self, config: &Config) -> Result<()>;
    pub fn get_profile(&self, name: &str) -> Result<Profile>;
    pub fn list_profiles(&self) -> Vec<String>;
    pub fn create_profile(&self, name: &str) -> Result<Profile>;
    pub fn delete_profile(&self, name: &str) -> Result<()>;
    pub fn export_profile(&self, name: &str, path: &Path) -> Result<()>;
    pub fn import_profile(&self, path: &Path) -> Result<Profile>;
    pub fn on_change(&self, callback: impl Fn(&Config) + 'static);
}

pub struct Config {
    pub version: u32,
    pub active_profile: String,
    pub audio: AudioConfig,
    pub hotkeys: HotkeyConfig,
    pub ui: UiConfig,
    pub virtual_mic: VirtualMicConfig,
    pub startup: StartupConfig,
}

pub struct AudioConfig {
    pub default_output_device: Option<String>,
    pub master_volume: f32,
    pub normalize_enabled: bool,
    pub target_lufs: f32,
    pub sample_rate: u32,
    pub buffer_size: u32,
}

pub struct Profile {
    pub name: String,
    pub collections: Vec<CollectionConfig>,
    pub hotkey_bindings: Vec<KeyBinding>,
    pub sound_volumes: HashMap<SoundId, f32>,
}
```

### logging

**Purpose:** Structured logging with `tracing`.

**Key decisions:**
- Use `tracing` for structured logging (not `log`).
- File logging with daily rotation via `tracing-appender`.
- Separate log levels: `info` for general, `debug` for audio, `trace` for PipeWire.
- Logs stored in `~/.local/share/zap/logs/`.
- Log viewer in the UI for debugging.

### shared

**Purpose:** Types shared between all crates and the Tauri layer.

Contains:
- `SoundId`, `CollectionId`, `HotkeyId` -- newtype IDs
- `AudioFormat`, `SampleRate`, `ChannelCount` -- audio types
- `Event` enum -- all events that can cross crate boundaries
- `Command` enum -- all commands that can cross crate boundaries
- `Error` -- shared error types with `thiserror`

---

## 5. Audio Engine

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Audio Engine                       │
│                                                     │
│  ┌───────────┐    ┌──────────┐    ┌──────────────┐ │
│  │  Decoder   │───►│  Mixer   │───►│  Output      │ │
│  │ (Symphonia)│    │          │    │  Router      │ │
│  └───────────┘    └──────────┘    └──────┬───────┘ │
│                                          │         │
│  ┌───────────┐    ┌──────────┐           │         │
│  │  Cache    │    │  Normalizer│          │         │
│  │ (in-mem)  │    │  (LUFS)  │           │         │
│  └───────────┘    └──────────┘           │         │
│                                          │         │
│  ┌──────────────────────────────────────┐│         │
│  │          Playback Manager            ││         │
│  │  - Track active sounds               ││         │
│  │  - Handle concurrent playback        ││         │
│  │  - Fade in/out                       ││         │
│  │  - Loop control                      ││         │
│  └──────────────────────────────────────┘│         │
└──────────────────────────────────────────┼─────────┘
                                           │
                              ┌────────────┼────────────┐
                              │            │            │
                              ▼            ▼            ▼
                         ┌────────┐  ┌──────────┐ ┌─────────┐
                         │ Speakers│  │ PipeWire │ │  Both   │
                         │ (cpal)  │  │ Stream   │ │         │
                         └────────┘  └──────────┘ └─────────┘
```

### Supported Formats

| Format | Crate | Feature Flag |
|--------|-------|-------------|
| MP3 | Symphonia | `symphonia-bundle-mp3` |
| WAV | Symphonia | `symphonia-bundle-wav` |
| FLAC | Symphonia | `symphonia-bundle-flac` |
| OGG Vorbis | Symphonia | `symphonia-codec-vorbis` |
| OPUS | Symphonia | `symphonia-codec-opus` |
| M4A/AAC | Symphonia | `symphonia-codec-aac` |
| AIFF | Symphonia | `symphonia-bundle-aiff` |

### Decoding Pipeline

1. **On import:** Read file, decode with Symphonia, store PCM samples + metadata in memory and DB.
2. **On play:** Retrieve pre-decoded PCM from cache. No decode latency.
3. **Cache eviction:** Keep most recently played sounds in memory. Evict LRU sounds when memory exceeds threshold.

### Mixing

- Support N simultaneous sounds.
- Mix at `f32` precision.
- Per-sound volume control applied before mixing.
- Master volume applied after mixing.
- Clipping protection: soft limiter on mix output.

### Normalization

- LUFS-based normalization (ITU-R BS.1770).
- Target: -14 LUFS (Spotify standard) or user-configurable.
- Pre-compute on import. Store normalized gain in metadata.
- Toggle per-sound or globally.

### Latency Targets

| Metric | Target | How |
|--------|--------|-----|
| Sound trigger to audio out | < 10ms | Pre-decoded PCM, small buffer |
| Hotkey to audio out | < 20ms | Hotkey event → audio engine → PipeWire stream |
| Virtual mic latency | < 15ms | PipeWire quantum 256, direct stream |
| Speaker monitoring | < 5ms | cpal with small buffer |

---

## 6. PipeWire Integration

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                  PipeWire Manager                    │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │              PipeWire Context                  │ │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────┐  │ │
│  │  │  Core    │  │ Registry │  │  Metadata  │  │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬───────┘  │ │
│  └───────┼──────────────┼──────────────┼──────────┘ │
│          │              │              │            │
│  ┌───────▼──────────────▼──────────────▼──────────┐ │
│  │           Virtual Device Manager               │ │
│  │                                                 │ │
│  │  ┌──────────────┐  ┌──────────────────────┐   │ │
│  │  │ Virtual Sink │  │ Virtual Source        │   │ │
│  │  │ (Audio/Sink) │  │ (Audio/Source/Virtual)│   │ │
│  │  └──────┬───────┘  └──────────┬───────────┘   │ │
│  │         │                     │                │ │
│  │         └────────┬────────────┘                │ │
│  │                  │ pw-link                     │ │
│  │                  ▼                             │ │
│  │         ┌──────────────┐                       │ │
│  │         │   Link       │                       │ │
│  │         │ monitor → src│                       │ │
│  │         └──────────────┘                       │ │
│  └─────────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │              Stream Manager                    │ │
│  │  ┌─────────────────────────────────────────┐  │ │
│  │  │  Playback Stream (Output to Sink)       │  │ │
│  │  │  - Decoded PCM → PipeWire buffer        │  │ │
│  │  │  - Format negotiation                   │  │ │
│  │  │  - Buffer management                    │  │ │
│  │  └─────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │              Graph Monitor                     │ │
│  │  - Node added/removed events                   │ │
│  │  - Device connect/disconnect                   │ │
│  │  - Link state changes                          │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### PipeWire Object Model

| Object | Zap Usage |
|--------|-----------|
| **Node (Audio/Sink)** | Virtual sink where Zap writes audio |
| **Node (Audio/Source/Virtual)** | Virtual microphone visible to apps |
| **Node (Audio/Source)** | Physical microphone (read from) |
| **Node (Audio/Sink)** | Physical speakers (monitor output) |
| **Link** | Connects virtual sink monitor to virtual source |
| **Stream** | Zap's PipeWire stream for writing audio |
| **Metadata** | Default device configuration |

### Virtual Device Properties

```rust
// Virtual Sink (where Zap writes audio)
let sink_props = properties! {
    "factory.name" => "support.null-audio-sink",
    "node.name" => "zap_sink",
    "node.description" => "Zap",
    "media.class" => "Audio/Sink",
    "audio.position" => "[ FL FR ]",
    "node.passive" => "true",
    "object.linger" => "true",
    "node.autoconnect" => "false",
};

// Virtual Source (what apps see as microphone)
let source_props = properties! {
    "factory.name" => "support.null-audio-sink",
    "node.name" => "zap_mic",
    "node.description" => "Zap Virtual Microphone",
    "media.class" => "Audio/Source/Virtual",
    "audio.position" => "[ FL FR ]",
    "node.passive" => "true",
    "object.linger" => "true",
    "node.autoconnect" => "false",
};
```

### Audio Flow

```
1. User triggers sound (hotkey/click)
2. Audio Engine retrieves pre-decoded PCM from cache
3. PipeWire Stream receives PCM in process callback
4. Stream writes to virtual sink (zap_sink)
5. PipeWire routes audio: zap_sink.monitor → zap_mic (via link)
6. Application (Discord/Minecraft/OBS) reads from zap_mic
7. Audio reaches other end of voice chat
```

### Device Discovery

```rust
pub fn list_audio_devices(&self) -> Vec<AudioDevice> {
    // Query PipeWire registry for all nodes
    // Filter by media.class (Audio/Sink, Audio/Source)
    // Return device info: name, description, channels, sample rates
}
```

### Session Management

- Connect to PipeWire on app startup.
- Create virtual devices if they don't exist.
- Re-create virtual devices if PipeWire restarts.
- Monitor PipeWire daemon status via `pw-mon` events.
- Graceful shutdown: remove virtual devices on app exit (optional, controlled by setting).

---

## 7. Virtual Microphone

### Recommended Approach: PipeWire Null-Sink + Monitor

This is the battle-tested approach used by every Linux soundboard application. It provides excellent compatibility with all target applications.

### Implementation

```
┌─────────────────────────────────────────────────────────┐
│                      Zap App                            │
│                                                         │
│  ┌──────────────┐                                       │
│  │ Audio Engine │ (decoded PCM)                         │
│  └──────┬───────┘                                       │
│         │                                               │
│         ▼                                               │
│  ┌──────────────┐                                       │
│  │ PipeWire     │                                       │
│  │ Stream       │ (Direction::Output)                   │
│  └──────┬───────┘                                       │
│         │                                               │
│         ▼                                               │
│  ┌──────────────────┐      ┌──────────────────────┐    │
│  │ zap_sink          │      │ zap_mic              │    │
│  │ (Audio/Sink)      │─────►│ (Audio/Source/Virtual)│   │
│  │ null-audio-sink   │pw-   │ null-audio-sink      │    │
│  └──────────────────┘ link └──────────┬───────────┘    │
│                                       │                 │
│                                       ▼                 │
│                              ┌──────────────────┐       │
│                              │ Discord / Minecraft│      │
│                              │ / OBS / Browser    │      │
│                              └──────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

### Implementation Options Comparison

| Criteria | Null-Sink (Recommended) | Custom SPA Node | PulseAudio Module | JACK Bridge | ALSA Loopback |
|----------|------------------------|-----------------|-------------------|-------------|---------------|
| **Latency** | 5-15ms | 1-5ms | 30-100ms | <5ms | 100-500ms |
| **Complexity** | Very Low | High | Low | High | Medium-High |
| **Root Required** | No | No | No | No | Yes |
| **Discord** | Excellent | Excellent | Good | Good | Poor |
| **Minecraft SVC** | Excellent | Excellent | Good | Good | Poor |
| **OBS** | Excellent | Excellent | Excellent | Excellent | Good |
| **Browsers** | Good | Excellent | Good | Good | Poor |
| **CPU Overhead** | Low | Low | Medium | Low | High |
| **Future-Proof** | Yes | Yes | Declining | Yes | No |

### Microphone Passthrough

Optionally mix the real microphone with soundboard audio:

```
Physical Mic → Capture Stream → Mixer → Virtual Sink → Virtual Source
Soundboard  → Decode/Cache  ↗
```

This allows users to talk AND play sounds through the same virtual microphone. The mixer applies per-input volume control.

### Cleanup

- Virtual devices persist via `object.linger = true`.
- On clean app exit, optionally remove virtual devices.
- On crash, devices remain until PipeWire restarts (acceptable behavior).
- Settings control whether devices are cleaned up on exit.

---

## 8. Hotkey Subsystem

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Hotkey Manager                        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Backend Selector                    │   │
│  │                                                  │   │
│  │  Priority:                                       │   │
│  │  1. XDG GlobalShortcuts Portal (Wayland-native)  │   │
│  │  2. X11 GlobalHotKey (X11 fallback)              │   │
│  │  3. evdev Raw Input (universal fallback)         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Binding Store                       │   │
│  │  - Load from settings                            │   │
│  │  - Persist on change                             │   │
│  │  - Conflict detection                            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Event Dispatcher                    │   │
│  │  - Key pressed → Play sound                      │   │
│  │  - Key released → Stop sound (push-to-play)     │   │
│  │  - Conflict detected → Notify user               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Backend Strategy

| Backend | Display Server | How It Works | Limitations |
|---------|---------------|--------------|-------------|
| **XDG Portal** | Wayland | Uses `org.freedesktop.portal.GlobalShortcuts` D-Bus interface | Requires GNOME 46+ or KDE 6+; portal must be running |
| **X11** | X11 | Uses `XGrabKey` via `global-hotkey` crate | X11 only; doesn't work on Wayland |
| **evdev** | Both | Reads `/dev/input/event*` directly | Requires `input` group; raw key codes; no modifier detection from evdev alone |

### Hotkey Types

| Type | Behavior | Use Case |
|------|----------|----------|
| **Trigger** | Press once to start, press again to stop | Most sounds |
| **Push-to-Play** | Hold to play, release to stop | Sound effects during conversation |
| **Toggle** | Press to start, press again to stop (same as trigger) | Background music |
| **One-shot** | Press to play once, no stop control | Notification sounds |

### Conflict Detection

```rust
pub fn check_conflict(&self, new_binding: &KeyBinding) -> Vec<Conflict> {
    self.bindings.iter()
        .filter(|existing| existing.key == new_binding.key && existing.modifiers == new_binding.modifiers)
        .map(|existing| Conflict {
            existing_id: existing.id,
            existing_action: existing.action.clone(),
            new_action: new_binding.action.clone(),
        })
        .collect()
}
```

### Key Binding Storage

```json
{
  "bindings": [
    {
      "id": "binding_001",
      "key": "F1",
      "modifiers": ["Control"],
      "action": {
        "type": "PlaySound",
        "sound_id": "snd_abc123"
      },
      "mode": "Trigger"
    },
    {
      "id": "binding_002",
      "key": "F2",
      "modifiers": [],
      "action": {
        "type": "StopAll"
      },
      "mode": "Trigger"
    }
  ]
}
```

---

## 9. UI Architecture

### Design Philosophy

The UI should feel like a modern application: fast, minimal, beautiful. Draw inspiration from Spotify (library organization), Discord (dark theme, density), Raycast (search, keyboard-first), and Linear (clean layouts, subtle animations).

### Component Architecture

```
App
├── Layout
│   ├── Sidebar (navigation)
│   ├── Header (search, global controls)
│   ├── Main Content (routed)
│   └── Footer (playback controls, volume)
│
├── Pages
│   ├── Dashboard
│   │   ├── QuickPlayGrid (recently played, favorites)
│   │   ├── NowPlaying
│   │   └── DeviceStatus
│   │
│   ├── Library
│   │   ├── CollectionSidebar (folders, tags)
│   │   ├── SoundGrid / SoundList (toggle view)
│   │   ├── SoundCard (thumbnail, name, duration, play button)
│   │   ├── SoundDetail (expanded view, waveform, metadata)
│   │   └── ImportDialog
│   │
│   ├── Hotkeys
│   │   ├── BindingList
│   │   ├── BindingEditor (key capture, action selector)
│   │   └── ConflictWarning
│   │
│   ├── Devices
│   │   ├── OutputDeviceSelector
│   │   ├── InputDeviceSelector (real mic)
│   │   ├── VirtualMicStatus
│   │   └── AudioRouting (visual graph)
│   │
│   ├── Settings
│   │   ├── GeneralSettings
│   │   ├── AudioSettings
│   │   ├── HotkeySettings
│   │   ├── AppearanceSettings (theme, language)
│   │   ├── ProfileManager
│   │   └── BackupRestore
│   │
│   ├── Logs
│   │   ├── LogViewer (filterable, searchable)
│   │   └── DiagnosticsPanel
│   │
│   └── About
│       ├── AppInfo
│       ├── Changelog
│       └── Credits
│
├── Components
│   ├── ui/ (shadcn/ui primitives)
│   ├── layout/ (AppShell, Sidebar, Header)
│   ├── library/ (SoundCard, SoundGrid, etc.)
│   ├── player/ (PlayButton, VolumeSlider, Waveform)
│   ├── settings/ (Form components)
│   └── common/ (Toast, Modal, Spinner)
│
└── Providers
    ├── QueryClientProvider (TanStack Query)
    ├── ThemeProvider
    └── TooltipProvider
```

### State Management

| Store | Purpose | Technology |
|-------|---------|------------|
| `playerStore` | Active playback state, current sound, volume | Zustand |
| `libraryStore` | Selected collection, view mode, sort/filter | Zustand |
| `uiStore` | Sidebar state, theme, modals | Zustand |
| Server state | Sound data, settings, device list | TanStack Query |

### Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Dashboard | Quick access, recently played, favorites |
| `/library` | Library | Browse all sounds |
| `/library/:collectionId` | Collection | Browse a specific collection |
| `/hotkeys` | Hotkeys | Manage key bindings |
| `/devices` | Devices | Audio device configuration |
| `/settings` | Settings | Application settings |
| `/settings/:tab` | Settings Tab | Specific settings section |
| `/logs` | Logs | Application logs |
| `/about` | About | App information |

### Responsive Design

- Minimum window size: 800x600.
- Sidebar collapses to icons below 1024px width.
- Sound grid adapts columns to window width (3-6 columns).
- Mobile-optimized layout (for future Tauri mobile support).

### Animations

- Page transitions: Framer Motion `AnimatePresence`.
- Sound card hover: Scale + shadow.
- Playback indicator: Pulsing waveform animation.
- Volume slider: Smooth value transition.
- Toast notifications: Slide in from bottom-right.

---

## 10. Sound Library

### Data Model

```
SoundLibrary
├── Collections (folders/groups)
│   ├── Collection
│   │   ├── id: CollectionId
│   │   ├── name: String
│   │   ├── path: PathBuf (source folder)
│   │   ├── sounds: Vec<SoundId>
│   │   └── auto_scan: bool
│   │
│   └── Tags
│       ├── id: TagId
│       ├── name: String
│       └── color: String
│
├── Sounds
│   ├── SoundEntry
│   │   ├── id: SoundId
│   │   ├── name: String
│   │   ├── file_path: PathBuf
│   │   ├── collection_id: CollectionId
│   │   ├── format: AudioFormat
│   │   ├── duration: Duration
│   │   ├── sample_rate: u32
│   │   ├── channels: u16
│   │   ├── file_size: u64
│   │   ├── volume: f32 (per-sound)
│   │   ├── normalized: bool
│   │   ├── tags: Vec<TagId>
│   │   ├── is_favorite: bool
│   │   ├── play_count: u64
│   │   ├── last_played: Option<DateTime>
│   │   ├── waveform_peaks: Option<Vec<f32>>
│   │   ├── metadata: AudioMetadata
│   │   ├── created_at: DateTime
│   │   └── updated_at: DateTime
│   │
│   └── AudioMetadata
│       ├── title: Option<String>
│       ├── artist: Option<String>
│       ├── album: Option<String>
│       ├── genre: Option<String>
│       ├── year: Option<u32>
│       └── artwork: Option<Vec<u8>>
│
└── Operations
    ├── Import (folder scan, file copy)
    ├── Search (name, tags, metadata)
    ├── Filter (format, duration, tags, favorites)
    ├── Sort (name, duration, play_count, last_played, created_at)
    ├── Tag management (add, remove, bulk)
    └── Favorites (toggle, list)
```

### Import Flow

1. User selects folder via file dialog.
2. Scan folder recursively for supported audio files.
3. For each file:
   a. Extract metadata with Symphonia.
   b. Decode to PCM.
   c. Compute waveform peaks.
   d. Normalize (if enabled).
   e. Store metadata in SQLite.
   f. Store PCM in memory cache.
4. Create collection entry.
5. Notify frontend of new sounds.

### Search Implementation

- Full-text search on sound name and metadata.
- Tag-based filtering.
- Duration range filtering.
- Format filtering.
- Favorites-only filter.
- Debounced input (300ms) for real-time filtering.

### Waveform Generation

- Decode audio to PCM on import.
- Compute peak values at fixed resolution (e.g., 1000 peaks per sound).
- Store peaks in database.
- Render as SVG or Canvas in frontend.
- Use for visual preview and playback position indicator.

---

## 11. Settings System

### Configuration File

Stored at `~/.config/zap/config.json`:

```json
{
  "version": 1,
  "active_profile": "default",
  "audio": {
    "default_output_device": null,
    "master_volume": 0.8,
    "normalize_enabled": true,
    "target_lufs": -14.0,
    "sample_rate": 48000,
    "buffer_size": 256,
    "mix_with_real_mic": false,
    "real_mic_device": null
  },
  "hotkeys": {
    "enabled": true,
    "backend": "auto",
    "stop_all_key": {
      "key": "Escape",
      "modifiers": []
    }
  },
  "virtual_mic": {
    "enabled": true,
    "name": "Zap Virtual Microphone",
    "cleanup_on_exit": false,
    "auto_create": true
  },
  "ui": {
    "theme": "dark",
    "language": "en",
    "sidebar_collapsed": false,
    "view_mode": "grid",
    "sort_by": "name",
    "sort_order": "asc"
  },
  "startup": {
    "launch_on_boot": false,
    "minimize_to_tray": true,
    "start_virtual_mic": true,
    "restore_last_profile": true
  },
  "library": {
    "collections": [],
    "auto_scan_on_launch": false,
    "max_cache_size_mb": 512
  }
}
```

### Profiles

- Each profile stores: collection list, hotkey bindings, per-sound volumes.
- Profiles enable different setups (gaming, streaming, work).
- Export/import as JSON files.
- Default profile created on first launch.

### Theme System

- Dark theme (default).
- Light theme.
- System preference (follows OS theme).
- Custom themes via CSS variables (future).

### Import/Export

- Export: Serialize config + all profiles to a single JSON file.
- Import: Deserialize and merge/replace config.
- Backup: Automatic backup before config migration.

---

## 12. Plugin System

### Architecture (Phase 2+)

```
┌─────────────────────────────────────────────────────────┐
│                    Plugin Manager                        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Plugin Registry                     │   │
│  │  - Discover plugins from plugin directory        │   │
│  │  - Load metadata (name, version, capabilities)   │   │
│  │  - Resolve dependencies                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Plugin Loader                       │   │
│  │  - Dynamic library loading (libloading)          │   │
│  │  - Symbol resolution                             │   │
│  │  - Lifecycle management (init, start, stop)      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Plugin Sandbox                      │   │
│  │  - Resource limits (CPU, memory)                 │   │
│  │  - API surface restriction                       │   │
│  │  - Error isolation                               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Plugin API                          │   │
│  │  - Audio processing hooks                        │   │
│  │  - UI extension points                           │   │
│  │  - Event subscriptions                           │   │
│  │  - Configuration access                          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Plugin Types

| Type | Hook Point | Example |
|------|-----------|---------|
| **Audio Effect** | Between decode and output | Reverb, Echo, Pitch Shift |
| **Audio Processor** | On the mixing stage | Compressor, Limiter, EQ |
| **Output Modifier** | On the PipeWire stream | Noise Gate, Noise Suppression |
| **UI Extension** | Settings page, toolbar | Streamer Mode panel |
| **Integration** | External service | Discord Rich Presence, Stream Deck |
| **Trigger** | Hotkey event | Voice Changer toggle |

### Plugin API (Rust)

```rust
pub trait Plugin: Send + Sync {
    fn name(&self) -> &str;
    fn version(&self) -> &str;
    fn description(&self) -> &str;
    fn init(&mut self, ctx: PluginContext) -> Result<()>;
    fn start(&mut self) -> Result<()>;
    fn stop(&mut self) -> Result<()>;
}

pub trait AudioEffect: Plugin {
    fn process(&mut self, buffer: &mut [f32], sample_rate: u32) -> Result<()>;
    fn set_parameter(&mut self, name: &str, value: f32) -> Result<()>;
    fn get_parameter(&self, name: &str) -> Option<f32>;
}

pub trait UiExtension: Plugin {
    fn settings_page(&self) -> Option<Box<dyn Widget>>;
    fn toolbar_items(&self) -> Vec<ToolbarItem>;
}
```

### Future Plugin Ideas

- Voice Changer (pitch shift, formant shift)
- Reverb / Echo / Delay
- Compressor / Limiter / Noise Gate
- Equalizer (parametric, graphic)
- Streamer Mode (auto-mute on stream)
- OBS WebSocket Integration
- Discord Rich Presence
- Stream Deck Support
- Audio Recording
- Sound Effect Chains

---

## 13. Logging

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Logging System                         │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              tracing Subscriber                  │   │
│  │  ┌───────────────┐  ┌──────────────┐           │   │
│  │  │  Console      │  │  File        │           │   │
│  │  │  (stdout)     │  │  (rotating)  │           │   │
│  │  └───────────────┘  └──────────────┘           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Log Categories                      │   │
│  │  - General (app lifecycle)                       │   │
│  │  - Audio (decode, playback, mixing)              │   │
│  │  - PipeWire (graph, nodes, links)                │   │
│  │  - Hotkey (registration, events)                 │   │
│  │  - Library (scan, import, metadata)              │   │
│  │  - Security (plugin loading, permissions)        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Log Storage                         │   │
│  │  ~/.local/share/zap/logs/                        │   │
│  │  ├── zap.log (current)                           │   │
│  │  ├── zap.log.2024-01-15 (rotated)                │   │
│  │  └── crash.log (fatal errors only)               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Log Levels

| Level | Use Case | Example |
|-------|----------|---------|
| `ERROR` | Fatal errors, crashes | PipeWire connection failed |
| `WARN` | Recoverable issues | Device disconnected, hotkey conflict |
| `INFO` | Normal operations | Sound loaded, device created |
| `DEBUG` | Detailed operations | Format negotiation, buffer fill |
| `TRACE` | Verbose debugging | PipeWire events, raw audio data |

### Structured Logging

```rust
// Example log entries
info!(sound = "airhorn.mp3", duration_ms = 2500, "Sound loaded");
debug!(format = "MP3", sample_rate = 48000, channels = 2, "Audio decoded");
trace!(node_id = 42, "PipeWire node added");
warn!(old_key = "Ctrl+F1", new_key = "Ctrl+F2", "Hotkey conflict resolved");
error!(error = %e, "Failed to create virtual microphone");
```

### Crash Logging

- Fatal errors logged to separate `crash.log`.
- Includes backtrace (when available).
- System information (OS, PipeWire version, kernel).
- Displayed in the Logs UI for user reporting.

---

## 14. Error Handling

### Error Taxonomy

```
ZapError
├── IoError (file operations, device access)
├── AudioError (decode, playback, format)
│   ├── UnsupportedFormat
│   ├── DecodeFailed
│   ├── PlaybackFailed
│   └── DeviceNotFound
├── PipeWireError (connection, node creation)
│   ├── ConnectionFailed
│   ├── NodeCreationFailed
│   ├── LinkFailed
│   └── DaemonNotRunning
├── HotkeyError (registration, conflict)
│   ├── RegistrationFailed
│   ├── ConflictDetected
│   └── BackendUnavailable
├── LibraryError (scan, import, metadata)
│   ├── FileNotFound
│   ├── ScanFailed
│   └── MetadataExtractionFailed
├── SettingsError (config, migration)
│   ├── ConfigNotFound
│   ├── ConfigCorrupted
│   └── MigrationFailed
├── PluginError (loading, execution)
│   ├── LoadFailed
│   ├── SymbolNotFound
│   └── ExecutionFailed
└── ValidationError (input, parameters)
```

### Error Recovery

| Error Type | Recovery Strategy |
|-----------|-------------------|
| PipeWire daemon not running | Show warning, retry connection, offer to start PipeWire |
| Device disconnected | Auto-reconnect, fallback to default device |
| Sound file not found | Mark as missing in library, offer to re-scan |
| Hotkey registration failed | Fallback to different backend, notify user |
| Config corrupted | Load defaults, offer to restore backup |
| Plugin crash | Unload plugin, continue running |

### Crash Reports

```rust
pub struct CrashReport {
    pub timestamp: DateTime<Utc>,
    pub error: String,
    pub backtrace: String,
    pub system_info: SystemInfo,
    pub pipewire_version: Option<String>,
    pub log_excerpt: String,
}
```

---

## 15. Security

### Sandboxing

- Flatpak sandboxing for the packaged application.
- Filesystem access limited to user-selected directories.
- No access to `/proc`, `/sys`, or other system paths.

### Permissions

- No root required for normal operation.
- PipeWire access requires user to be in the `pipewire` group (default on most distros).
- evdev hotkey backend requires user to be in the `input` group.
- No privilege escalation for virtual device creation.

### Plugin Security

- Plugins loaded from user-configurable directory only.
- Plugins run in the same process (no process isolation in v1).
- Resource limits enforced via monitoring (CPU, memory).
- Plugin API surface is restricted (no direct filesystem or network access).
- Future: WASM-based plugin sandboxing.

### Filesystem

- Sound files referenced by path (not copied by default).
- Config stored in XDG directories.
- Logs stored in XDG data directory.
- No access to other user files.

---

## 16. Performance

### Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| Cold startup | < 2s | Lazy initialization, async loading |
| Hot startup | < 500ms | Process reuse, cache warm |
| Sound trigger latency | < 10ms | Pre-decoded PCM, small buffer |
| Memory usage (idle) | < 50MB | Minimal dependencies, lazy loading |
| Memory usage (active) | < 200MB | LRU cache for decoded audio |
| CPU usage (idle) | < 1% | No polling, event-driven |
| CPU usage (playback) | < 5% | Efficient mixing, SIMD where available |
| Bundle size | < 30MB | Tauri tree-shaking, optimized assets |

### Optimization Strategies

1. **Pre-decode on import** -- Decode once, play from memory.
2. **LRU cache** -- Keep most-used sounds in memory, evict others.
3. **Lazy loading** -- Don't scan library until UI requests it.
4. **Event-driven** -- PipeWire callbacks, hotkey events, not polling.
5. **Minimal allocations** -- Reuse buffers in audio path.
6. **SIMD mixing** -- Use `std::simd` (nightly) or manual SIMD for f32 mixing.
7. **Async I/O** -- `tokio` for file operations, not blocking threads.

### Caching Strategy

```
Memory Cache (hot)
├── Recently played sounds (PCM)
├── Favorite sounds (PCM)
└── Waveform peaks

Disk Cache (warm)
├── SQLite database (metadata, peaks)
└── Config files

Cold Storage (on-demand)
└── Original audio files (read on import/scan)
```

---

## 17. Testing Strategy

### Test Types

| Type | Scope | Tool |
|------|-------|------|
| **Unit Tests** | Individual functions, pure logic | `cargo test` |
| **Integration Tests** | Crate interactions, data flow | `cargo test` (integration/) |
| **Audio Tests** | Decode, mix, normalize correctness | Custom test harness with reference files |
| **PipeWire Tests** | Virtual device creation, linking | Require running PipeWire daemon |
| **UI Tests** | Component rendering, interaction | Vitest + React Testing Library |
| **E2E Tests** | Full application flow | Playwright (Tauri WebView) |
| **Benchmarks** | Audio decode, mix, cache performance | `criterion` |

### Test Structure

```
zap/
├── crates/
│   ├── audio-engine/
│   │   ├── src/
│   │   │   └── lib.rs
│   │   └── tests/
│   │       ├── decoder_test.rs
│   │       ├── mixer_test.rs
│   │       └── fixtures/
│   │           ├── sine_440.wav
│   │           ├── sine_440.mp3
│   │           └── silence.wav
│   └── ...
├── apps/desktop/
│   └── src/
│       └── __tests__/
│           ├── components/
│           └── hooks/
```

### CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable
      - name: Install PipeWire dev
        run: sudo apt-get install libpipewire-0.3-dev
      - name: Run tests
        run: cargo test --workspace
      - name: Run clippy
        run: cargo clippy --workspace -- -D warnings
      - name: Check formatting
        run: cargo fmt --check

  ui-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
      - name: Install dependencies
        run: pnpm install
      - name: Run UI tests
        run: pnpm test
```

---

## 18. Packaging

### Formats

| Format | Target Audience | Notes |
|--------|----------------|-------|
| **AUR** | Arch Linux users | PKGBUILD for `zap-bin` |
| **Flatpak** | Universal Linux | Sandboxed, auto-updates |
| **AppImage** | Portable Linux | No installation required |
| **DEB** | Debian/Ubuntu | Traditional package |
| **RPM** | Fedora/RHEL | Traditional package |

### Flatpak Configuration

```yaml
app-id: com.zap.soundboard
runtime: org.freedesktop.Platform
runtime-version: '24.08'
sdk: org.freedesktop.Sdk
command: zap
finish-args:
  - --share=ipc
  - --socket=x11
  - --socket=wayland
  - --socket=pulseaudio
  - --device=dri
  - --filesystem=home
  - --talk-name=org.freedesktop.portal.GlobalShortcuts
  - --talk-name=org.freedesktop.portal.ScreenCast
modules:
  - name: zap
    buildsystem: simple
    build-commands:
      - cargo build --release
      - install -Dm755 target/release/zap /app/bin/zap
    sources:
      - type: dir
        path: .
```

### AUR PKGBUILD

```bash
pkgname=zap-bin
pkgver=0.1.0
pkgrel=1
pkgdesc="A modern, open-source, PipeWire-native soundboard for Linux"
arch=('x86_64')
url="https://github.com/zap-soundboard/zap"
license=('MIT')
depends=('pipewire' 'alsa-lib')
optdepends=('wireplumber: session management')
source=("$url/releases/download/v$pkgver/zap-$pkgver-linux-x86_64.tar.gz")
sha256sums=('SKIP')

package() {
    install -Dm755 "$srcdir/zap" "$pkgdir/usr/bin/zap"
    install -Dm644 "$srcdir/zap.desktop" "$pkgdir/usr/share/applications/zap.desktop"
}
```

---

## 19. Documentation

### README

- Project description and screenshots
- Features list
- Installation instructions (AUR, Flatpak, AppImage, build from source)
- Quick start guide
- Keyboard shortcuts
- Troubleshooting
- Contributing
- License

### Developer Guide

- Development environment setup
- Building from source
- Project structure overview
- Running tests
- Code style guidelines
- Architecture overview (this document)

### Plugin Guide

- Plugin API reference
- Creating your first plugin
- Audio effect plugins
- UI extension plugins
- Testing plugins
- Publishing plugins

### API Docs

- `audio-engine` crate API
- `pipewire-manager` crate API
- `virtual-mic` crate API
- `hotkeys` crate API
- `sound-library` crate API

---

## 20. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-3)

**Goals:** Project setup, workspace configuration, shared types.

**Tasks:**
- [ ] Initialize Tauri v2 project with React frontend
- [ ] Set up Cargo workspace with all crates
- [ ] Configure shared crate with common types
- [ ] Set up build tooling (Vite, TailwindCSS, shadcn/ui)
- [ ] Configure CI (GitHub Actions)
- [ ] Set up linting (Clippy, ESLint, Prettier)
- [ ] Create basic project documentation

**Milestones:**
- Empty Tauri app builds and runs
- All crates compile
- CI passes

**Risks:**
- Tauri v2 Linux-specific quirks
- Cargo workspace dependency resolution

**Dependencies:** None

**Deliverables:** Working project skeleton

---

### Phase 2: Audio Engine (Weeks 4-6)

**Goals:** Audio decoding, caching, and playback.

**Tasks:**
- [ ] Implement `audio-engine` crate
  - [ ] Symphonia-based decoder for all formats
  - [ ] In-memory PCM cache with LRU eviction
  - [ ] Multi-channel mixer
  - [ ] Volume control (per-sound and master)
  - [ ] LUFS normalization
  - [ ] Playback state machine
- [ ] Implement cpal output for speaker monitoring
- [ ] Write unit tests with reference audio files
- [ ] Benchmark decode and mix performance

**Milestones:**
- Decode MP3, WAV, FLAC, OGG, OPUS
- Mix multiple sounds simultaneously
- Play audio to speakers via cpal

**Risks:**
- Symphonia codec bugs
- cpal ALSA compatibility issues
- Memory usage with large libraries

**Dependencies:** Phase 1

**Deliverables:** Working audio engine crate

---

### Phase 3: PipeWire Integration (Weeks 7-10)

**Goals:** PipeWire connection, virtual devices, streaming.

**Tasks:**
- [ ] Implement `pipewire-manager` crate
  - [ ] PipeWire context and connection management
  - [ ] Virtual sink creation (Audio/Sink)
  - [ ] Virtual source creation (Audio/Source/Virtual)
  - [ ] Port linking (monitor → source)
  - [ ] Playback stream (write decoded PCM to sink)
  - [ ] Device enumeration
  - [ ] Graph monitoring (node added/removed)
  - [ ] Reconnection on PipeWire restart
- [ ] Implement `virtual-mic` crate
  - [ ] PipeWire provider
  - [ ] PulseAudio fallback provider
  - [ ] Microphone passthrough mixing
- [ ] Integration tests with PipeWire daemon
- [ ] Test with Discord, OBS

**Milestones:**
- Virtual microphone appears in PulseAudio/PipeWire
- Audio flows from app to virtual mic
- Discord/OBS can capture virtual mic audio

**Risks:**
- pipewire-rs instability
- WirePlumber interference
- Thread safety issues

**Dependencies:** Phase 2

**Deliverables:** Working PipeWire integration, virtual microphone

---

### Phase 4: Sound Library (Weeks 11-13)

**Goals:** File management, metadata, organization.

**Tasks:**
- [ ] Implement `sound-library` crate
  - [ ] Folder scanning with `walkdir`
  - [ ] Metadata extraction with Symphonia
  - [ ] SQLite storage via `storage` crate
  - [ ] Collection management
  - [ ] Tag system
  - [ ] Favorites
  - [ ] Search and filtering
  - [ ] Waveform peak generation
- [ ] Implement `storage` crate
  - [ ] SQLite connection pool
  - [ ] Schema migrations
  - [ ] Repository pattern
- [ ] Implement import flow in Tauri commands
- [ ] Library UI components

**Milestones:**
- Import folders of sounds
- Search and filter sounds
- Tag and favorite sounds
- Display waveform previews

**Risks:**
- Large library performance
- SQLite migration complexity
- Metadata extraction edge cases

**Dependencies:** Phase 2

**Deliverables:** Working sound library with UI

---

### Phase 5: Hotkeys (Weeks 14-16)

**Goals:** Global hotkey registration and management.

**Tasks:**
- [ ] Implement `hotkeys` crate
  - [ ] Backend trait and selector
  - [ ] XDG GlobalShortcuts Portal backend
  - [ ] X11 backend (global-hotkey)
  - [ ] evdev fallback backend
  - [ ] Conflict detection
  - [ ] Push-to-play support
  - [ ] Key binding persistence
- [ ] Hotkey settings UI
- [ ] Key capture component
- [ ] Conflict warning UI

**Milestones:**
- Register global hotkeys on Wayland and X11
- Play sounds via hotkey
- Detect and resolve conflicts

**Risks:**
- Wayland portal availability
- evdev permission issues
- Backend compatibility across distros

**Dependencies:** Phase 2, Phase 4

**Deliverables:** Working global hotkey system

---

### Phase 6: UI Polish (Weeks 17-20)

**Goals:** Complete, polished UI.

**Tasks:**
- [ ] Dashboard page
- [ ] Library page with grid/list views
- [ ] Sound detail panel
- [ ] Hotkey management page
- [ ] Device configuration page
- [ ] Settings page with profiles
- [ ] Log viewer page
- [ ] About page
- [ ] System tray integration
- [ ] Dark/light theme
- [ ] Animations (Framer Motion)
- [ ] Keyboard navigation
- [ ] Responsive layout

**Milestones:**
- All pages implemented
- System tray with minimize
- Theme switching works

**Risks:**
- WebKitGTK rendering differences
- Performance with large libraries
- Accessibility compliance

**Dependencies:** Phase 3, Phase 4, Phase 5

**Deliverables:** Complete, polished UI

---

### Phase 7: Settings & Profiles (Weeks 21-22)

**Goals:** Configuration management, profiles, import/export.

**Tasks:**
- [ ] Implement `settings` crate
  - [ ] Config model and validation
  - [ ] Profile management
  - [ ] Import/export
  - [ ] Config migration
  - [ ] File I/O
- [ ] Settings UI with all sections
- [ ] Profile switching
- [ ] Backup/restore

**Milestones:**
- Config persists across restarts
- Profiles work correctly
- Import/export tested

**Risks:**
- Config migration complexity
- Profile data consistency

**Dependencies:** Phase 4, Phase 5

**Deliverables:** Complete settings system

---

### Phase 8: Logging & Diagnostics (Weeks 23-24)

**Goals:** Structured logging, crash reporting, diagnostics.

**Tasks:**
- [ ] Implement `logging` crate
  - [ ] tracing subscriber setup
  - [ ] File logging with rotation
  - [ ] Audio-specific logging
  - [ ] PipeWire logging
  - [ ] Crash logging
- [ ] Log viewer UI
- [ ] Diagnostics panel
- [ ] System information display

**Milestones:**
- Logs written to file
- Log viewer displays logs
- Crash reports generated

**Risks:**
- Log file size management
- Performance impact of logging

**Dependencies:** Phase 3

**Deliverables:** Complete logging system

---

### Phase 9: Error Handling & Resilience (Weeks 25-26)

**Goals:** Robust error handling, recovery, crash reports.

**Tasks:**
- [ ] Define error types for all crates
- [ ] Implement error recovery strategies
- [ ] Crash report generation
- [ ] User-facing error dialogs
- [ ] Graceful degradation

**Milestones:**
- Errors don't crash the app
- Recovery works for common failures
- Crash reports are useful

**Risks:**
- Edge cases in error recovery
- PipeWire reconnection reliability

**Dependencies:** All previous phases

**Deliverables:** Resilient application

---

### Phase 10: Packaging & Release (Weeks 27-30)

**Goals:** Distribution packages, documentation, release.

**Tasks:**
- [ ] AUR package
- [ ] Flatpak package
- [ ] AppImage build
- [ ] DEB package
- [ ] RPM package
- [ ] README documentation
- [ ] Developer guide
- [ ] Plugin guide (Phase 2+)
- [ ] Release workflow (GitHub Actions)
- [ ] Auto-update mechanism
- [ ] Beta testing

**Milestones:**
- All package formats build and install
- Documentation complete
- First stable release

**Risks:**
- Package-specific dependencies
- Cross-distribution compatibility
- Auto-update security

**Dependencies:** All previous phases

**Deliverables:** Production-ready release

---

### Phase 11: Plugin System (Weeks 31-36)

**Goals:** Extensible plugin architecture.

**Tasks:**
- [ ] Implement `plugins` crate
  - [ ] Plugin loader (libloading)
  - [ ] Plugin API surface
  - [ ] Plugin manager
  - [ ] Resource monitoring
  - [ ] Plugin settings UI
- [ ] Create 2-3 example plugins
- [ ] Plugin documentation
- [ ] Plugin development guide

**Milestones:**
- Load and run plugins
- Audio effect plugins work
- UI extensions work

**Risks:**
- Plugin API stability
- Performance impact
- Security vulnerabilities

**Dependencies:** All previous phases

**Deliverables:** Plugin system with example plugins

---

## 21. Coding Rules

### Rust

1. **Clippy warnings are errors** in CI.
2. **`#[deny(missing_docs)]`** on all public items.
3. **Error types** use `thiserror` for crate errors, `anyhow` for applications.
4. **No `unwrap()` in library code** -- use `?` or proper error handling.
5. **`#[must_use]`** on functions that return values.
6. **Prefer `&str` over `String`** in function parameters.
7. **Use `Arc<T>` for shared ownership**, `Rc<T>` only in single-threaded contexts.
8. **Avoid `clone()` in hot paths** -- use references or `Rc`.
9. **Document all public APIs** with doc comments.
10. **Keep functions under 50 lines** -- extract helpers if longer.

### TypeScript

1. **Strict TypeScript** -- `noImplicitAny`, `strictNullChecks`.
2. **Prefer interfaces over types** for object shapes.
3. **Use `const` assertions** for literal types.
4. **No `any`** -- use `unknown` and type guards.
5. **Component files under 200 lines** -- extract hooks and sub-components.
6. **Custom hooks** for all business logic.
7. **Zustand stores** for client state only.
8. **TanStack Query** for all server state.

### General

1. **Single responsibility** -- each module does one thing.
2. **Composition over inheritance** -- prefer traits and generics.
3. **Avoid premature abstraction** -- wait for patterns to emerge.
4. **Test before merge** -- CI must pass.
5. **Code review** -- all changes reviewed before merge.
6. **Conventional commits** -- `feat:`, `fix:`, `docs:`, `refactor:`, etc.

---

## 22. Risks and Tradeoffs

### Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| pipewire-rs instability | High | Medium | Use pactl/pw-link as fallback; pin versions |
| Wayland hotkey issues | High | High | Multiple backends; evdev fallback; document limitations |
| Tauri v2 Linux WebView quirks | Medium | Medium | Test early on Linux; report upstream issues |
| Audio format edge cases | Medium | Low | Comprehensive test suite with reference files |
| Memory usage with large libraries | Medium | Medium | LRU cache; lazy loading; configurable limits |
| Cross-distro compatibility | Medium | Medium | Flatpak as primary; AUR for Arch; test on major distros |

### Architecture Tradeoffs

| Decision | Pro | Con |
|----------|-----|-----|
| Null-sink over custom SPA node | Simple, proven, compatible | Slightly higher latency, two nodes needed |
| Tauri over native GUI | Modern UI, web ecosystem, cross-platform potential | Larger bundle, web overhead |
| SQLite over JSON files | Better performance at scale, query support | More complex setup, migration needed |
| Pre-decode on import | Instant playback, no decode latency | Higher memory usage |
| Separate crates over monolith | Testable, reusable, clean boundaries | More complex build, more files |
| Zustand + TanStack Query | Clear state separation, cached server state | Two state systems to learn |

---

## 23. Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Language | Rust | Safety, performance, ecosystem |
| Frontend | React + TypeScript | Mature ecosystem, Tauri support |
| CSS | TailwindCSS + shadcn/ui | Rapid development, consistent design |
| State | Zustand + TanStack Query | Client/server separation |
| Audio Decoding | Symphonia | Pure Rust, comprehensive, modular |
| Audio Output | cpal | Cross-platform, ALSA/PulseAudio/PipeWire |
| PipeWire | pipewire-rs + pactl fallback | Native when possible, CLI fallback |
| Virtual Mic | Null-sink + monitor | Battle-tested, compatible |
| Hotkeys | XDG Portal + X11 + evdev | Multi-backend for Wayland/X11 |
| Database | SQLite (rusqlite) | Local, fast, well-tested |
| Config | JSON (serde) | Human-readable, debuggable |
| Logging | tracing | Structured, performance-aware |
| Build | Cargo workspace + pnpm | Rust + JS monorepo |
| CI | GitHub Actions | Standard, free for open source |
| Packaging | Flatpak + AUR + AppImage | Cover all Linux users |
