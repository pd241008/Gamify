package config

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"strings"
)

// Config holds all configuration values for the ingestion service.
// All external configuration is loaded once at startup and passed
// to components via dependency injection — no component should
// call os.Getenv() directly.
type Config struct {
	// Esports API (PandaScore)
	EsportsAPIBaseURL string
	EsportsAPIKey     string

	// Cassandra / DataStax Astra DB
	AstraDBToken string // Application token for Astra DB authentication
	AstraDBID    string // Astra DB database ID

	// Upstash QStash
	QStashURL               string
	QStashToken             string
	QStashCurrentSigningKey string
	QStashNextSigningKey    string

	// Notification delivery
	WebhookURL string // Destination URL where QStash delivers match notifications
}

// required lists the env vars that must be set for the pipeline to run.
// The pipeline will fail fast at startup if any of these are missing.
var required = []string{
	"ESPORTS_API_BASE_URL",
	"ESPORTS_API_KEY",
	"ASTRA_DB_TOKEN",
	"ASTRA_DB_ID",
	"QSTASH_URL",
	"QSTASH_TOKEN",
}

// Load reads configuration from environment variables.
// It first attempts to load a .env file from the project root (for local dev),
// then reads all required env vars. Returns an error if any required var is missing.
func Load() (*Config, error) {
	
	loadEnvFile("../../.env") 
	loadEnvFile(".env")       

	
	var missing []string
	for _, key := range required {
		if getEnv(key) == "" {
			missing = append(missing, key)
		}
	}
	if len(missing) > 0 {
		return nil, fmt.Errorf("missing required environment variables: %s", strings.Join(missing, ", "))
	}

	cfg := &Config{
		EsportsAPIBaseURL:       getEnv("ESPORTS_API_BASE_URL"),
		EsportsAPIKey:           getEnv("ESPORTS_API_KEY"),
		AstraDBToken:            getEnv("ASTRA_DB_TOKEN"),
		AstraDBID:               getEnv("ASTRA_DB_ID"),
		QStashURL:               getEnv("QSTASH_URL"),
		QStashToken:             getEnv("QSTASH_TOKEN"),
		QStashCurrentSigningKey: getEnv("QSTASH_CURRENT_SIGNING_KEY"),
		QStashNextSigningKey:    getEnv("QSTASH_NEXT_SIGNING_KEY"),
		WebhookURL:              getEnv("WEBHOOK_URL"),
	}

	log.Println("✅ Configuration loaded successfully")
	return cfg, nil
}


func getEnv(key string) string {
	val := os.Getenv(key)
	// Strip surrounding double quotes if present.
	if len(val) >= 2 && val[0] == '"' && val[len(val)-1] == '"' {
		val = val[1 : len(val)-1]
	}
	return val
}

// loadEnvFile reads a .env file and sets environment variables that
// are not already set in the environment. This ensures that explicitly
// set env vars (e.g., from GitHub Actions) always take precedence.``
func loadEnvFile(path string) {
	file, err := os.Open(path)
	if err != nil {
		// .env file is optional — not an error if it doesn't exist.
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())

		// Skip empty lines and comments.
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		// Split on the first '=' only.
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}

		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])

		// Strip surrounding quotes from the value.
		if len(value) >= 2 {
			if (value[0] == '"' && value[len(value)-1] == '"') ||
				(value[0] == '\'' && value[len(value)-1] == '\'') {
				value = value[1 : len(value)-1]
			}
		}

		// Only set if not already set — explicit env vars take precedence.
		if os.Getenv(key) == "" {
			os.Setenv(key, value)
		}
	}
}

// PrintRedacted logs the loaded configuration with sensitive values masked.
// Safe for use in CI/CD logs.
func (c *Config) PrintRedacted() {
	log.Println("─── Configuration ───")
	log.Printf("  ESPORTS_API_BASE_URL : %s", c.EsportsAPIBaseURL)
	log.Printf("  ESPORTS_API_KEY      : %s", redact(c.EsportsAPIKey))
	log.Printf("  ASTRA_DB_TOKEN       : %s", redact(c.AstraDBToken))
	log.Printf("  ASTRA_DB_ID          : %s", redact(c.AstraDBID))
	log.Printf("  QSTASH_URL           : %s", c.QStashURL)
	log.Printf("  QSTASH_TOKEN         : %s", redact(c.QStashToken))
	log.Printf("  WEBHOOK_URL          : %s", c.WebhookURL)
	log.Println("─────────────────────")
}

// redact masks a sensitive value, showing only the first 4 and last 4 characters.
func redact(s string) string {
	if len(s) <= 10 {
		return "****"
	}
	return s[:4] + "****" + s[len(s)-4:]
}
