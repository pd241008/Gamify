package main

import (
	"fmt"
	"log"
	"os"
)

func main() {
	fmt.Println("Starting Ingestion Gateway...")

	// TODO: Phase 1 - Configuration Management
	// - Implement config loader in `internal/config`
	// - Load ESPORTS_API_KEY, ASTRA_DB_TOKEN, QSTASH_TOKEN, etc.
	if os.Getenv("ESPORTS_API_KEY") == "" {
		log.Println("WARNING: ESPORTS_API_KEY is not set.")
	}

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

	fmt.Println("Ingestion gateway initialized successfully. Awaiting implementation.")
}
