package api

import (
	"encoding/json"
	"log"
	"net/http"

	"ingestion/db"

	"github.com/gocql/gocql"
)

// StartServer begins the HTTP server to serve matches to the frontend.
func StartServer(session *gocql.Session, addr string) {
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

		matches, err := db.FetchAllMatches(session)
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

	log.Printf("Server listening on %s...", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
