# Project Structure

## Overview

Zap uses a monorepo structure with workspace crates and a shared TypeScript package.

## Directory Layout

```
zap/
├── apps/
│   └── desktop/                    # Tauri desktop application
│       ├── src/                    # React frontend source
│       │   ├── components/         # Reusable UI components
│       │   │   ├── ui/             # shadcn/ui base components
│       │   │   └── layout/         # App shell, sidebar, header
│       │   ├── pages/              # Route-level components
│       │   ├── hooks/              # Custom React hooks
│       │   ├── stores/             # Zustand stores
│       │   ├── lib/                # Utilities, API wrappers
│       │   │   ├── tauri.ts        # Typed IPC wrappers
│       │   │   └── utils.ts        # Utility functions
│       │   ├── types/              # TypeScript type definitions
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── src-tauri/              # Tauri Rust backend
│       │   ├── src/
│       │   │   ├── main.rs
│       │   │   ├── lib.rs          # Builder, plugin registration
│       │   │   ├── commands/       # Tauri command modules
│       │   │   ├── state.rs        # Managed state types
│       │   │   └── errors.rs       # Tauri error types
│       │   ├── capabilities/
│       │   └── tauri.conf.json
│       ├── package.json
│       ├── vite.config.ts
│       └── tailwind.config.js
│
├── crates/                         # Rust workspace crates
│   ├── shared/                     # Common types, events, errors
│   ├── storage/                    # SQLite persistence
│   ├── settings/                   # Configuration management
│   ├── logging/                    # Structured logging
│   ├── audio-engine/               # Audio decoding and playback
│   ├── pipewire-manager/           # PipeWire integration
│   ├── virtual-mic/                # Virtual microphone
│   ├── hotkeys/                    # Global hotkey system
│   ├── sound-library/              # Sound organization
│   └── plugins/                    # Plugin system
│
├── packages/
│   └── shared/                     # Shared TypeScript types
│
├── docs/                           # Documentation
├── .github/                        # CI/CD and templates
├── Cargo.toml                      # Workspace root
├── package.json                    # Workspace root (pnpm)
└── pnpm-workspace.yaml
```

## Crate Dependencies

```
shared (no deps)
    ↑
storage, logging, audio-engine, hotkeys, plugins
    ↑
settings (depends on storage)
sound-library (depends on storage, audio-engine)
pipewire-manager
    ↑
virtual-mic (depends on pipewire-manager)
    ↑
Tauri app (depends on all crates)
```

## Frontend Architecture

- **React Router** — Page routing
- **Zustand** — Client-side state (player, library, UI)
- **TanStack Query** — Server state (future API calls)
- **shadcn/ui** — Component primitives
- **TailwindCSS** — Utility-first styling
- **Framer Motion** — Animations (future)

## IPC Flow

```
React Component
    ↓ (calls service function)
Frontend Service (src/lib/tauri.ts)
    ↓ (invokes Tauri command)
Tauri Command (src-tauri/src/commands/)
    ↓ (delegates to crate)
Workspace Crate
    ↓ (returns result)
Tauri serializes to frontend
```
