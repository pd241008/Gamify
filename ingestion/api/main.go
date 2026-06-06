package handler

import (
	"crypto/ed25519"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"ingestion/broker"
	"ingestion/db"
	internalastra "ingestion/internal/astra"
	"ingestion/internal/config"
	"ingestion/internal/parser"
	"ingestion/internal/qstash"
	"ingestion/internal/sync"
)

// Discord Interaction Types
const (
	InteractionTypePing               = 1
	InteractionTypeApplicationCommand = 2
)

// Discord Interaction Response Types
const (
	InteractionResponsePong                   = 1
	InteractionResponseDeferredChannelMessage = 5
)

type DiscordInteraction struct {
	Type  int             `json:"type"`
	Token string          `json:"token"`
	Data  json.RawMessage `json:"data"`
}

type DiscordResponse struct {
	Type int `json:"type"`
}

var (
	cfg           *config.Config
	manager       *sync.Manager
	matchBroker   *broker.Broker
	esportsClient *parser.EsportsParser
)

func init() {
	var err error
	cfg, err = config.Load()
	if err != nil {
		log.Printf("Failed to load configuration: %v", err)
	}

	if cfg != nil {
		syncCfg := sync.Config{
			AstraDBToken:  cfg.AstraDBToken,
			AstraDBID:     cfg.AstraDBID,
			AstraKeyspace: cfg.AstraKeyspace,
			LocalDBFile:   "local_db.json",
		}
		manager = sync.NewManager(syncCfg)

		qstashClient, err := qstash.NewClient(cfg.QStashURL, cfg.QStashToken)
		if err == nil {
			matchBroker, _ = broker.NewBroker(qstashClient, cfg.WebhookURL)
		} else {
			log.Printf("Failed to initialize QStash client: %v", err)
		}

		fetcher := parser.NewFetcher(cfg.EsportsAPIBaseURL, cfg.EsportsAPIKey)
		esportsClient = parser.NewEsportsParser(fetcher)
	}
}

func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	switch r.URL.Path {
	case "/api/discord/interactions":
		handleDiscordInteractions(w, r)
	case "/api/ingest":
		handleIngest(w, r)
	case "/api/matches":
		handleMatches(w, r)
	case "/api/tournaments":
		handleTournaments(w, r)
	case "/api/health":
		handleHealth(w, r)
	case "/api/debug/matches":
		handleDebugMatches(w, r)
	default:
		http.NotFound(w, r)
	}
}

func handleDiscordInteractions(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	publicKeyHex := os.Getenv("DISCORD_PUBLIC_KEY")
	publicKey, err := hex.DecodeString(publicKeyHex)
	if err != nil {
		http.Error(w, "Invalid public key config", http.StatusInternalServerError)
		return
	}

	signatureHex := r.Header.Get("X-Signature-Ed25519")
	timestamp := r.Header.Get("X-Signature-Timestamp")

	if signatureHex == "" || timestamp == "" {
		http.Error(w, "Missing signatures", http.StatusUnauthorized)
		return
	}

	signature, err := hex.DecodeString(signatureHex)
	if err != nil {
		http.Error(w, "Invalid signature format", http.StatusBadRequest)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Cannot read body", http.StatusInternalServerError)
		return
	}

	verified := ed25519.Verify(publicKey, append([]byte(timestamp), body...), signature)
	if !verified {
		http.Error(w, "Invalid request signature", http.StatusUnauthorized)
		return
	}

	var interaction DiscordInteraction
	if err := json.Unmarshal(body, &interaction); err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	if interaction.Type == InteractionTypePing {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(DiscordResponse{Type: InteractionResponsePong})
		return
	}

	if interaction.Type == InteractionTypeApplicationCommand {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(DiscordResponse{Type: InteractionResponseDeferredChannelMessage})
		go processAnalytics(interaction.Token, interaction.Data)
		return
	}
}

func processAnalytics(token string, data json.RawMessage) {
	// Execute core business logic here
}

func handleIngest(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	authHeader := r.Header.Get("Authorization")
	expectedAuth := "Bearer " + os.Getenv("INGESTION_SECRET_KEY")
	if authHeader != expectedAuth {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if esportsClient == nil || manager == nil || matchBroker == nil {
		http.Error(w, "Pipeline components not initialized properly", http.StatusInternalServerError)
		return
	}

	log.Println("Ingestion triggered via cron. Starting pipeline...")

	upcomingMatches, err := esportsClient.GetUpcomingMatches()
	if err != nil {
		log.Printf("⚠️  Error fetching upcoming matches: %v", err)
	}

	runningMatches, err := esportsClient.GetRunningMatches()
	if err != nil {
		log.Printf("⚠️  Error fetching running matches: %v", err)
	}

	allMatches := append(upcomingMatches, runningMatches...)
	log.Printf("Fetched %d total matches (%d upcoming, %d running)", len(allMatches), len(upcomingMatches), len(runningMatches))

	tournamentMatches := make(map[string][]parser.Match)
	for _, match := range allMatches {
		tID := fmt.Sprintf("%d", match.TournamentID)
		tournamentMatches[tID] = append(tournamentMatches[tID], match)
	}

	activeStore := manager.GetActiveStore()

	for tID, incoming := range tournamentMatches {
		existing, err := activeStore.FetchExistingMatches(tID)
		if err != nil {
			log.Printf("⚠️  Failed to fetch existing matches for tournament %s: %v", tID, err)
			continue
		}

		toInsert, toUpdate := db.GetDeltas(existing, incoming)
		log.Printf("Tournament %s: %d new, %d updated", tID, len(toInsert), len(toUpdate))

		for _, m := range toInsert {
			if err := activeStore.SaveMatch(m); err != nil {
				log.Printf("⚠️  Failed to insert match %d: %v", m.ID, err)
				continue
			}

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

			if cfg != nil && !strings.Contains(cfg.WebhookURL, "localhost") {
				go func(match parser.Match, p broker.MatchNotificationPayload) {
					if _, err := matchBroker.ScheduleMatchNotification(match.ScheduledAt, p); err != nil {
						log.Printf("⚠️  Failed to schedule notification for match %d: %v", match.ID, err)
					}
				}(m, payload)
			}
		}

		for _, m := range toUpdate {
			if err := activeStore.UpdateMatch(m); err != nil {
				log.Printf("⚠️  Failed to update match %d: %v", m.ID, err)
			}
		}
	}

	log.Println("✅ Ingestion Pipeline completed successfully.")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"success", "message":"Ingestion complete"}`))
}

func handleMatches(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if manager == nil {
		http.Error(w, "Database manager not initialized", http.StatusInternalServerError)
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
}

func handleTournaments(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if manager == nil {
		http.Error(w, "Database manager not initialized", http.StatusInternalServerError)
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
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	if cfg == nil {
		http.Error(w, "Config not loaded", http.StatusInternalServerError)
		return
	}

	log.Println("Testing Astra DB connection...")
	version, elapsed, err := internalastra.HealthCheck(cfg.AstraDBToken, cfg.AstraDBID, cfg.AstraKeyspace)
	if err != nil {
		log.Printf("Error connecting to Astra DB: %v", err)
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	log.Printf("Astra DB version: %s (connected in %s)", version, elapsed)
	fmt.Fprintf(w, "Connected successfully. DB Version: %s", version)
}

func handleDebugMatches(w http.ResponseWriter, r *http.Request) {
	if esportsClient == nil {
		http.Error(w, "Parser not initialized", http.StatusInternalServerError)
		return
	}

	matches, err := esportsClient.GetUpcomingMatches()
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
