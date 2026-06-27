//! Theme definitions and parsing.

use std::fmt;
use std::str::FromStr;

/// Supported application themes.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
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

impl fmt::Display for Theme {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

impl FromStr for Theme {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "dark" => Ok(Self::Dark),
            "light" => Ok(Self::Light),
            "system" => Ok(Self::System),
            other => Err(format!("Unknown theme: '{other}'")),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_theme_display() {
        assert_eq!(format!("{}", Theme::Dark), "dark");
        assert_eq!(format!("{}", Theme::Light), "light");
        assert_eq!(format!("{}", Theme::System), "system");
    }

    #[test]
    fn test_theme_from_str() {
        assert_eq!("dark".parse::<Theme>().unwrap(), Theme::Dark);
        assert_eq!("LIGHT".parse::<Theme>().unwrap(), Theme::Light);
        assert_eq!("system".parse::<Theme>().unwrap(), Theme::System);
        assert!("invalid".parse::<Theme>().is_err());
    }
}
