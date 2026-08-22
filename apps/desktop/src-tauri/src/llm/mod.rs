//! LLM adapter for AI analysis (OpenAI-compatible)

use serde::{Deserialize, Serialize};

/// LLM configuration
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct LlmConfig {
    pub base_url: String,
    pub api_key: String, // Never persisted, passed per-request
    pub model: String,
    #[serde(default = "default_timeout")]
    pub timeout_ms: u64,
}

fn default_timeout() -> u64 {
    45000
}

/// Call LLM API and return raw response
pub async fn call_llm(
    config: &LlmConfig,
    system_prompt: &str,
    user_prompt: &str,
) -> Result<String, String> {
    let client = reqwest::Client::new();
    
    let response = client.post(format!("{}/chat/completions", config.base_url))
        .header("Authorization", format!("Bearer {}", config.api_key))
        .header("Content-Type", "application/json")
        .json(&serde_json::json!({
            "model": config.model,
            "messages": [
                { "role": "system", "content": system_prompt },
                { "role": "user", "content": user_prompt }
            ],
            "temperature": 0.1,
            "response_format": { "type": "json_object" }
        }))
        .timeout(std::time::Duration::from_millis(config.timeout_ms))
        .send()
        .await
        .map_err(|e| format!("LLM request failed: {}", e))?;
    
    if !response.status().is_success() {
        return Err(format!("LLM API error: {}", response.status()));
    }
    
    let body: serde_json::Value = response.json()
        .await
        .map_err(|e| format!("Failed to parse LLM response: {}", e))?;
    
    let content = body["choices"][0]["message"]["content"]
        .as_str()
        .ok_or("No content in LLM response")?
        .to_string();
    
    Ok(content)
}
