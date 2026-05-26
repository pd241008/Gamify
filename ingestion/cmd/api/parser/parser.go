package parser

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	internalparser "ingestion/internal/parser"
)


func MatchesHandler(w http.ResponseWriter, r *http.Request) {
	apiKey := os.Getenv("ESPORTS_API_KEY")
	baseURL := os.Getenv("ESPORTS_API_BASE_URL")
	
	if baseURL == "" {
		log.Println("ESPORTS_API_BASE_URL is not set in environment")
		http.Error(w, "Server configuration error", http.StatusInternalServerError)
		return
	}

	fetcher := internalparser.NewFetcher(baseURL, apiKey)
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
