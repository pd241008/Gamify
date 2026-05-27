package astra

import (
	"fmt"
	"log"
	"net/http"

	internalastra "ingestion/internal/astra"
	"ingestion/internal/config"
)

// NewHandler returns an HTTP handler that tests the Astra DB connection.
// Config is loaded from the centralized config loader — no direct env var access.
func NewHandler(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Println("Testing Astra DB connection...")

		version, elapsed, err := internalastra.HealthCheck(cfg.AstraDBToken, cfg.AstraDBID)
		if err != nil {
			log.Printf("Error connecting to Astra DB: %v", err)
			http.Error(w, "Database connection failed", http.StatusInternalServerError)
			return
		}

		log.Printf("Astra DB version: %s (connected in %s)", version, elapsed)
		fmt.Fprintf(w, "Connected successfully. DB Version: %s", version)
	}
}
