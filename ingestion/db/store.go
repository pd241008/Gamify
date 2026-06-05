package db

import (
	"ingestion/internal/parser"
)

// Store defines the interface for database operations so we can hot-swap between Cassandra and a Local mock DB.
type Store interface {
	EnsureSchema() error
	FetchMatches(tournamentID string) ([]map[string]interface{}, error)
	FetchTournaments() ([]map[string]string, error)
	FetchExistingMatches(tournamentID string) (map[string]parser.Match, error)
	SaveMatch(match parser.Match) error
	UpdateMatch(match parser.Match) error
	Close() error
}
