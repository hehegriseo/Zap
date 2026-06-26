//! Tracing subscriber initialization.

use tracing::info;
use tracing_subscriber::fmt;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::EnvFilter;

use crate::error::LoggingResult;
use crate::file::{create_file_appender, FileLogConfig};

/// Initializes the tracing subscriber with console and file output.
///
/// This should be called once at application startup.
///
/// # Errors
///
/// Returns `LoggingError` if log files cannot be created.
pub fn init_logging() -> LoggingResult<()> {
    let file_config = FileLogConfig::default();
    let file_appender = create_file_appender(&file_config)?;

    let env_filter =
        EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info,zap=debug"));

    let file_layer = fmt::layer()
        .with_writer(file_appender)
        .with_ansi(false)
        .with_target(true)
        .with_thread_ids(true);

    let console_layer = fmt::layer().with_target(true).with_thread_ids(true);

    tracing_subscriber::registry()
        .with(env_filter)
        .with(console_layer)
        .with(file_layer)
        .init();

    info!(
        log_dir = %file_config.directory.display(),
        "Logging initialized"
    );

    Ok(())
}
