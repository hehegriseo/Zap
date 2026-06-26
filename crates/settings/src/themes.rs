//! Theme definitions (placeholder for Sprint 0).

/// Supported application themes.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub enum Theme {
    /// Dark theme (default).
    #[default]
    Dark,
    /// Light theme.
    Light,
    /// Follow system preference.
    System,
}

impl Theme {
    /// Returns the CSS class name for this theme.
    #[must_use]
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Dark => "dark",
            Self::Light => "light",
            Self::System => "system",
        }
    }
}
