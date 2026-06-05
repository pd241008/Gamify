package main

import (
	"fmt"
	"ingestion/api"
	"ingestion/broker"
	"ingestion/db"
	"ingestion/internal/config"
	"ingestion/internal/parser"
	"ingestion/internal/qstash"
	"ingestion/internal/sync"
	"log"
	"strings"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}
	cfg.PrintRedacted()

	syncCfg := sync.Config{
		AstraDBToken:  cfg.AstraDBToken,
		AstraDBID:     cfg.AstraDBID,
		AstraKeyspace: cfg.AstraKeyspace,
		LocalDBFile:   "local_db.json",
	}

	syncManager := sync.NewManager(syncCfg)

	qstashClient, err := qstash.NewClient(cfg.QStashURL, cfg.QStashToken)
	if err != nil {
		log.Fatalf("Failed to initialize QStash client: %v", err)
	}

	matchBroker, err := broker.NewBroker(qstashClient, cfg.WebhookURL)
	if err != nil {
		log.Fatalf("Failed to initialize broker: %v", err)
	}
	log.Println("✅ QStash broker initialized")

	fetcher := parser.NewFetcher(cfg.EsportsAPIBaseURL, cfg.EsportsAPIKey)
	esportsClient := parser.NewEsportsParser(fetcher)
	log.Println("✅ Esports API client initialized")

	log.Println("Starting Ingestion Pipeline...")

	// Fetch upcoming matches
	upcomingMatches, err := esportsClient.GetUpcomingMatches()
	if err != nil {
		log.Printf("⚠️  Error fetching upcoming matches: %v", err)
	}

	// Fetch running matches
	runningMatches, err := esportsClient.GetRunningMatches()
	if err != nil {
		log.Printf("⚠️  Error fetching running matches: %v", err)
	}

	allMatches := append(upcomingMatches, runningMatches...)
	log.Printf("Fetched %d total matches (%d upcoming, %d running)", len(allMatches), len(upcomingMatches), len(runningMatches))

	// Group matches by tournament ID
	tournamentMatches := make(map[string][]parser.Match)
	for _, match := range allMatches {
		tID := fmt.Sprintf("%d", match.TournamentID)
		tournamentMatches[tID] = append(tournamentMatches[tID], match)
	}

	activeStore := syncManager.GetActiveStore()

	// Process each tournament
	for tID, incoming := range tournamentMatches {
		existing, err := activeStore.FetchExistingMatches(tID)
		if err != nil {
			log.Printf("⚠️  Failed to fetch existing matches for tournament %s: %v", tID, err)
			continue
		}

		toInsert, toUpdate := db.GetDeltas(existing, incoming)
		log.Printf("Tournament %s: %d new, %d updated", tID, len(toInsert), len(toUpdate))

		// Process Inserts
		for _, m := range toInsert {
			if err := activeStore.SaveMatch(m); err != nil {
				log.Printf("⚠️  Failed to insert match %d: %v", m.ID, err)
				continue
			}

			// Schedule QStash notification for new matches
			payload := broker.MatchNotificationPayload{
				MatchID:      fmt.Sprintf("%d", m.ID),
				MatchName:    m.Name,
				TournamentID: fmt.Sprintf("%d", m.TournamentID),
				Status:       m.Status,
				ScheduledAt:  m.ScheduledAt.Format("2006-01-02T15:04:05Z07:00"),
				TeamA:        m.TeamA,
				TeamB:        m.TeamB,
				TeamAName:    m.TeamAName,
				TeamBName:    m.TeamBName,
				TeamALogo:    m.TeamALogo,
				TeamBLogo:    m.TeamBLogo,
				Videogame:    m.Videogame,
			}

			if !strings.Contains(cfg.WebhookURL, "localhost") {
				go func(match parser.Match, p broker.MatchNotificationPayload) {
					if _, err := matchBroker.ScheduleMatchNotification(match.ScheduledAt, p); err != nil {
						log.Printf("⚠️  Failed to schedule notification for match %d: %v", match.ID, err)
					}
				}(m, payload)
			}
		}

		// Process Updates
		for _, m := range toUpdate {
			if err := activeStore.UpdateMatch(m); err != nil {
				log.Printf("⚠️  Failed to update match %d: %v", m.ID, err)
			}
		}
	}

	log.Println("✅ Ingestion Pipeline completed successfully. Starting HTTP API server...")
	api.StartServer(syncManager, ":8080")
}
