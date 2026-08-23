//! Credential management (P1: OS Keychain, P0: Memory-only)

use std::sync::Mutex;

/// Secret storage trait for different platforms
pub trait SecretStore {
    /// Save a secret
    fn save(&self, key: &str, value: &str) -> Result<(), String>;
    
    /// Get a secret
    fn get(&self, key: &str) -> Result<Option<String>, String>;
    
    /// Delete a secret
    fn delete(&self, key: &str) -> Result<(), String>;
}

/// Memory-only secret store (default, no persistence)
#[derive(Default)]
pub struct MemorySecretStore {
    secrets: Mutex<std::collections::HashMap<String, String>>,
}

impl SecretStore for MemorySecretStore {
    fn save(&self, key: &str, value: &str) -> Result<(), String> {
        let mut map = self.secrets.lock().map_err(|e| e.to_string())?;
        map.insert(key.to_string(), value.to_string());
        Ok(())
    }
    
    fn get(&self, key: &str) -> Result<Option<String>, String> {
        let map = self.secrets.lock().map_err(|e| e.to_string())?;
        Ok(map.get(key).cloned())
    }
    
    fn delete(&self, key: &str) -> Result<(), String> {
        let mut map = self.secrets.lock().map_err(|e| e.to_string())?;
        map.remove(key);
        Ok(())
    }
}

/// Get application data directory
pub fn get_data_dir() -> std::path::PathBuf {
    #[cfg(target_os = "macos")]
    {
        dirs::home_dir()
            .map(|h| h.join("Library").join("Application Support").join("MailMind"))
            .unwrap_or_default()
    }
    #[cfg(target_os = "windows")]
    {
        std::env::var("APPDATA")
            .ok()
            .map(|p| std::path::PathBuf::from(p).join("MailMind"))
            .unwrap_or_default()
    }
    #[cfg(target_os = "linux")]
    {
        std::env::var("XDG_DATA_HOME")
            .ok()
            .map(|p| std::path::PathBuf::from(p).join("mailmind"))
            .or_else(|_| std::env::var("HOME").map(|h| std::path::PathBuf::from(h).join(".local").join("share").join("mailmind")))
            .unwrap_or_default()
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    {
        std::path::PathBuf::from(".")
    }
}
