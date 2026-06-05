package api

import (
	"encoding/json"
	"log"
	"net/http"

	"ingestion/internal/sync"
)

// StartServer begins the HTTP server to serve matches to the frontend.
func StartServer(manager *sync.Manager, addr string) {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/matches", func(w http.ResponseWriter, r *http.Request) {
		// CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*") // Allow any origin for local dev
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		if r.Method != "GET" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		tournamentID := r.URL.Query().Get("tournament")

		activeStore := manager.GetActiveStore()
		matches, err := activeStore.FetchMatches(tournamentID)
		if err != nil {
			log.Printf("Error fetching matches: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(matches); err != nil {
			log.Printf("Error encoding JSON: %v", err)
		}
	})

	mux.HandleFunc("/api/tournaments", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		if r.Method != "GET" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		activeStore := manager.GetActiveStore()
		tournaments, err := activeStore.FetchTournaments()
		if err != nil {
			log.Printf("Error fetching tournaments: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(tournaments); err != nil {
			log.Printf("Error encoding JSON: %v", err)
		}
	})

	log.Printf("Server listening on %s...", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
