# Contributing to Zap

Thank you for your interest in contributing to Zap!

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch: `git checkout -b feature/my-feature`
4. Make your changes
5. Run tests: `cargo test && pnpm test`
6. Run lint: `cargo clippy && pnpm lint`
7. Commit your changes
8. Push to your fork and submit a pull request

## Development Setup

See [DEVELOPMENT.md](DEVELOPMENT.md) for environment setup.

## Code Style

### Rust

- Follow `rustfmt` formatting
- All clippy warnings must be fixed
- Document all public items with doc comments
- No `unwrap()` in library code
- Use `thiserror` for error types

### TypeScript

- Strict TypeScript (`noImplicitAny`, `strictNullChecks`)
- Prefer interfaces over types for object shapes
- No `any` — use `unknown` and type guards
- Component files under 200 lines
- Custom hooks for all business logic

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation
- `refactor:` — Code refactoring
- `test:` — Adding tests
- `chore:` — Maintenance

## Pull Request Guidelines

- Keep PRs focused on a single change
- Include tests for new functionality
- Update documentation if needed
- Ensure CI passes before requesting review

## Questions?

Open a [Discussion](https://github.com/zap-soundboard/zap/discussions) for questions.
