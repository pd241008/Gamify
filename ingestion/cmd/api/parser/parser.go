package parser

import (
	"encoding/json"
	"log"
	"net/http"

	"ingestion/internal/config"
	internalparser "ingestion/internal/parser"
)

// NewHandler returns an HTTP handler that fetches and returns upcoming matches.
// Config is loaded from the centralized config loader — no direct env var access.
func NewHandler(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fetcher := internalparser.NewFetcher(cfg.EsportsAPIBaseURL, cfg.EsportsAPIKey)
		esportsParser := internalparser.NewEsportsParser(fetcher)

		matches, err := esportsParser.GetUpcomingMatches()
		if err != nil {
			log.Printf("Error fetching matches: %v", err)
			http.Error(w, "Failed to fetch matches", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(matches); err != nil {
			log.Printf("Error encoding matches response: %v", err)
		}
	}
}
