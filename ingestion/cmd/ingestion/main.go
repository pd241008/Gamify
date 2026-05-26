package main

import (
	"fmt"
	"log"
	"net/http"
)

// TODO: Phase 1 - Configuration Management
// - Implement config loader in `internal/config`
// - Load ESPORTS_API_KEY, ASTRA_DB_TOKEN, QSTASH_TOKEN, etc.

// TODO: Phase 2 - Persistence Layer Setup
// - Initialize Cassandra/Astra DB client using `pkg/store`
// storeClient := store.NewCassandraClient(config)

// TODO: Phase 2 - Messaging Layer Setup
// - Initialize QStash client using `pkg/broker`
// brokerClient := broker.NewQStashClient(config)

// TODO: Phase 2 - Esports API Client
// - Initialize the 3rd party API client using `pkg/esports`
// esportsClient := esports.NewClient(config)

// TODO: Phase 2 - Core Service Orchestration
// - Initialize the core orchestration service using `internal/service`
// - Pass in the store, broker, and esports clients via dependency injection
// orchestrationService := service.NewIngestionService(esportsClient, storeClient, brokerClient)

// TODO: Start Polling Job
// - Execute the polling logic to fetch matches, calculate deltas, and publish to QStash
// err := orchestrationService.Run()

func route(w http.ResponseWriter, r *http.Request) {
	_, err := fmt.Fprintf(w, "Hello world")
	if err != nil {
		// Log the error if we fail to write to the client
		log.Printf("Error writing response to client: %v\n", err)
	}
}

func routes(w http.ResponseWriter, r *http.Request) {
	_, err := fmt.Fprintf(w, "Welcome To Gamify API Pipeline")
	if err != nil {
		log.Printf("Error writing Response to Client: %v\n", err)
	}
}

func main() {
	http.HandleFunc("/", routes)
	// Explicitly ignoring the error/byte count for stdout
	_, _ = fmt.Println("Starting Ingestion Gateway...")

	http.HandleFunc("/hello-world", route)

	_, _ = fmt.Println("Ingestion gateway initialized successfully. Listening on port 8888...")

	err := http.ListenAndServe(":8888", nil)
	if err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
