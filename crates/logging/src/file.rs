//! Log file management with rotation.

use std::path::PathBuf;

use tracing_appender::rolling::{RollingFileAppender, Rotation};

use crate::error::{LoggingError, LoggingResult};

/// Configuration for file-based logging.
pub struct FileLogConfig {
    /// Directory to store log files.
    pub directory: PathBuf,
    /// Log file prefix (e.g., "zap").
    pub prefix: String,
    /// Maximum number of log files to retain.
    pub max_files: usize,
}

impl Default for FileLogConfig {
    fn default() -> Self {
        let log_dir = dirs::data_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("zap")
            .join("logs");

        Self {
            directory: log_dir,
            prefix: "zap".to_string(),
            max_files: 7,
        }
    }
}

/// Creates a rolling file appender for daily log rotation.
///
/// # Errors
///
/// Returns `LoggingError` if the log directory cannot be created.
pub fn create_file_appender(config: &FileLogConfig) -> LoggingResult<RollingFileAppender> {
    std::fs::create_dir_all(&config.directory)?;

    let appender = RollingFileAppender::builder()
        .rotation(Rotation::DAILY)
        .filename_prefix(&config.prefix)
        .max_log_files(config.max_files)
        .build(&config.directory)
        .map_err(|e| LoggingError::InvalidPath(e.to_string()))?;

    Ok(appender)
}
