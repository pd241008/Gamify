package db

import (
	"encoding/json"
	"fmt"
	"ingestion/pkg/parser"
	"os"
	"sync"
)

type LocalStore struct {
	mu       sync.RWMutex
	filePath string
	matches  map[string]parser.Match
}

func NewLocalStore(filePath string) *LocalStore {
	store := &LocalStore{
		filePath: filePath,
		matches:  make(map[string]parser.Match),
	}
	_ = store.loadFromFile() // Ignore error on first load, file may not exist
	return store
}

func (s *LocalStore) loadFromFile() error {
	data, err := os.ReadFile(s.filePath)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, &s.matches)
}

func (s *LocalStore) saveToFile() error {
	data, err := json.MarshalIndent(s.matches, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.filePath, data, 0644)
}

func (s *LocalStore) EnsureSchema() error {
	return nil // Nothing to do for local JSON
}

func (s *LocalStore) FetchMatches(tournamentID string) ([]map[string]interface{}, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var results []map[string]interface{}

	for mID, m := range s.matches {
		tID := fmt.Sprintf("%d", m.TournamentID)
		if tournamentID != "" && tournamentID != tID {
			continue
		}

		displayTeamA := m.TeamAName
		displayTeamB := m.TeamBName

		name := displayTeamA + " vs " + displayTeamB
		if displayTeamA == "" && displayTeamB == "" {
			name = "TBD vs TBD"
		}

		results = append(results, map[string]interface{}{
			"id":          mID,
			"name":        name,
			"tournament":  m.League.Name, // Using League Name for better display
			"status":      m.Status,
			"scheduledAt": m.ScheduledAt.Format("2006-01-02T15:04:05Z07:00"),
			"score":       m.Score,
			"teamA": map[string]string{
				"id":      m.TeamA,
				"name":    displayTeamA,
				"logoUrl": m.TeamALogo,
			},
			"teamB": map[string]string{
				"id":      m.TeamB,
				"name":    displayTeamB,
				"logoUrl": m.TeamBLogo,
			},
			"videogame": m.Videogame,
		})
	}
	return results, nil
}

func (s *LocalStore) FetchTournaments() ([]map[string]string, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	tSet := make(map[string]string)
	for _, m := range s.matches {
		tID := fmt.Sprintf("%d", m.TournamentID)
		tSet[tID] = m.League.Name
	}

	var results []map[string]string
	for tID, name := range tSet {
		results = append(results, map[string]string{
			"id":   tID,
			"name": name,
		})
	}
	return results, nil
}

func (s *LocalStore) FetchExistingMatches(tournamentID string) (map[string]parser.Match, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	results := make(map[string]parser.Match)
	for mID, m := range s.matches {
		tID := fmt.Sprintf("%d", m.TournamentID)
		if tournamentID == tID {
			results[mID] = m
		}
	}
	return results, nil
}

func (s *LocalStore) SaveMatch(match parser.Match) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	mID := fmt.Sprintf("%d", match.ID)
	s.matches[mID] = match
	return s.saveToFile()
}

func (s *LocalStore) UpdateMatch(match parser.Match) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	mID := fmt.Sprintf("%d", match.ID)
	s.matches[mID] = match
	return s.saveToFile()
}

func (s *LocalStore) Close() error {
	return nil
}
