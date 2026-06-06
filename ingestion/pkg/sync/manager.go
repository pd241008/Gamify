package sync

import (
	"fmt"
	"ingestion/db"
	"ingestion/pkg/astra"
	"log"
	"sync"
	"time"
)

type Config struct {
	AstraDBToken  string
	AstraDBID     string
	AstraKeyspace string
	LocalDBFile   string
}

type Manager struct {
	mu          sync.RWMutex
	activeStore db.Store
	isLocal     bool
	cfg         Config
	localStore  *db.LocalStore
	stopChecker chan struct{}
}

func NewManager(cfg Config) *Manager {
	m := &Manager{
		cfg:         cfg,
		stopChecker: make(chan struct{}),
	}

	m.localStore = db.NewLocalStore(cfg.LocalDBFile)

	// Try to connect to Astra DB initially
	session, err := astra.NewSession(cfg.AstraDBToken, cfg.AstraDBID, cfg.AstraKeyspace)
	if err == nil {
		cStore := db.NewCassandraStore(session)
		if err := cStore.EnsureSchema(); err == nil {
			log.Println("✅ Connected to Astra DB natively")
			m.activeStore = cStore
			m.isLocal = false
			return m
		}
	}

	log.Printf("⚠️  Astra DB unavailable on startup. Falling back to Local JSON DB (%s)", cfg.LocalDBFile)
	m.activeStore = m.localStore
	m.isLocal = true

	// Start background checker
	go m.startPeriodicCheck()

	return m
}

func (m *Manager) startPeriodicCheck() {
	ticker := time.NewTicker(15 * time.Second) // Check frequently for demo purposes
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			session, err := astra.NewSession(m.cfg.AstraDBToken, m.cfg.AstraDBID, m.cfg.AstraKeyspace)
			if err != nil {
				continue
			}

			cStore := db.NewCassandraStore(session)
			if err := cStore.EnsureSchema(); err != nil {
				cStore.Close()
				continue
			}

			log.Println("🔄 Astra DB is back online! Synchronizing local data to Astra...")

			// Get all tournaments in local
			tournaments, _ := m.localStore.FetchTournaments()
			for _, t := range tournaments {
				tID := t["id"]
				localMatches, _ := m.localStore.FetchExistingMatches(tID)

				// Fetch existing in cassandra to do delta sync
				cassandraMatches, err := cStore.FetchExistingMatches(tID)
				if err != nil {
					continue
				}

				// We want to insert/update local matches into Cassandra
				for _, match := range localMatches {
					mIDStr := fmt.Sprintf("%d", match.ID)
					if cMatch, exists := cassandraMatches[mIDStr]; exists {
						if cMatch.Status != match.Status || cMatch.Score != match.Score || cMatch.Videogame != match.Videogame || cMatch.League.Name != match.League.Name {
							_ = cStore.UpdateMatch(match)
						}
					} else {
						_ = cStore.SaveMatch(match)
					}
				}
			}

			log.Println("✅ Synchronization complete. Hot-swapping active DB to Astra DB!")
			m.mu.Lock()
			m.activeStore = cStore
			m.isLocal = false
			m.mu.Unlock()

			return // Stop checking
		case <-m.stopChecker:
			return
		}
	}
}

// GetActiveStore returns the currently active store (Cassandra or Local)
func (m *Manager) GetActiveStore() db.Store {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.activeStore
}

// IsLocal returns true if the system is running in offline fallback mode
func (m *Manager) IsLocal() bool {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.isLocal
}
