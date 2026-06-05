package main

import (
	"fmt"
	"ingestion/internal/astra"
	"ingestion/internal/config"
	"log"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	session, err := astra.NewSession(cfg.AstraDBToken, cfg.AstraDBID, cfg.AstraKeyspace)
	if err != nil {
		log.Fatalf("Failed to connect to Cassandra: %v", err)
	}
	defer session.Close()

	if err := session.Query("TRUNCATE matches_by_tournament").Exec(); err != nil {
		log.Fatalf("Failed to truncate table: %v", err)
	}

	fmt.Println("Successfully truncated matches_by_tournament in Astra DB.")
}
