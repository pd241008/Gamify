package db

import (
	"fmt"
	"time"

	"github.com/gocql/gocql"
)

// Schema CQL for the matches_by_tournament table.
// Partition key: tournament_id
// Clustering columns: start_time (DESC), match_id
const createMatchesTableCQL = `
CREATE TABLE IF NOT EXISTS matches_by_tournament (
    tournament_id text,
    scheduled_at timestamp,
    match_id text,
    status text,
    score text,
    team_a text,
    team_b text,
    team_a_name text,
    team_b_name text,
    team_a_logo text,
    team_b_logo text,
    videogame text,
    PRIMARY KEY (tournament_id, scheduled_at, match_id)
) WITH CLUSTERING ORDER BY (scheduled_at ASC);
`

// CassandraStore implements the Store interface for Astra DB.
type CassandraStore struct {
	session *gocql.Session
}

// NewCassandraStore creates a new CassandraStore.
func NewCassandraStore(session *gocql.Session) *CassandraStore {
	return &CassandraStore{session: session}
}

// Close closes the underlying Cassandra session.
func (c *CassandraStore) Close() error {
	if c.session != nil {
		c.session.Close()
	}
	return nil
}

// EnsureSchema creates the matches_by_tournament table if it does not already exist.
func (c *CassandraStore) EnsureSchema() error {
	if c.session == nil {
		return fmt.Errorf("cassandra session is nil")
	}

	if err := c.session.Query(createMatchesTableCQL).Exec(); err != nil {
		return fmt.Errorf("failed to create matches_by_tournament table: %w", err)
	}

	// Safely attempt to add new columns if table already existed without them
	_ = c.session.Query(`ALTER TABLE matches_by_tournament ADD team_a_name text;`).Exec()
	_ = c.session.Query(`ALTER TABLE matches_by_tournament ADD team_b_name text;`).Exec()
	_ = c.session.Query(`ALTER TABLE matches_by_tournament ADD team_a_logo text;`).Exec()
	_ = c.session.Query(`ALTER TABLE matches_by_tournament ADD team_b_logo text;`).Exec()
	_ = c.session.Query(`ALTER TABLE matches_by_tournament ADD videogame text;`).Exec()

	return nil
}

// FetchMatches retrieves matches for the frontend API, optionally filtering by tournament.
func (c *CassandraStore) FetchMatches(tournamentID string) ([]map[string]interface{}, error) {
	if c.session == nil {
		return nil, fmt.Errorf("cassandra session is nil")
	}

	var iter *gocql.Iter
	if tournamentID != "" {
		query := `SELECT tournament_id, scheduled_at, match_id, status, score, team_a, team_b, team_a_name, team_b_name, team_a_logo, team_b_logo, videogame FROM matches_by_tournament WHERE tournament_id = ?`
		iter = c.session.Query(query, tournamentID).Iter()
	} else {
		// LIMIT 50 is used for demonstration, allowing across-partition queries in Astra DB.
		query := `SELECT tournament_id, scheduled_at, match_id, status, score, team_a, team_b, team_a_name, team_b_name, team_a_logo, team_b_logo, videogame FROM matches_by_tournament LIMIT 50`
		iter = c.session.Query(query).Iter()
	}

	var matches []map[string]interface{}
	var tID, mID, status, score, teamA, teamB, teamAName, teamBName, teamALogo, teamBLogo, videogame string
	var startTime time.Time

	for iter.Scan(&tID, &startTime, &mID, &status, &score, &teamA, &teamB, &teamAName, &teamBName, &teamALogo, &teamBLogo, &videogame) {
		displayTeamA := teamAName
		displayTeamB := teamBName

		name := displayTeamA + " vs " + displayTeamB
		if displayTeamA == "" && displayTeamB == "" {
			name = "TBD vs TBD"
		}
		
		matches = append(matches, map[string]interface{}{
			"id":          mID,
			"name":        name,
			"tournament":  "Tournament " + tID,
			"status":      status,
			"scheduledAt": startTime.Format("2006-01-02T15:04:05Z07:00"),
			"score":       score,
			"teamA": map[string]string{
				"id":      teamA,
				"name":    displayTeamA,
				"logoUrl": teamALogo,
			},
			"teamB": map[string]string{
				"id":      teamB,
				"name":    displayTeamB,
				"logoUrl": teamBLogo,
			},
		})
	}

	if err := iter.Close(); err != nil {
		return nil, fmt.Errorf("failed to fetch matches: %w", err)
	}

	return matches, nil
}

// FetchTournaments retrieves a list of distinct tournament IDs.
func (c *CassandraStore) FetchTournaments() ([]map[string]string, error) {
	if c.session == nil {
		return nil, fmt.Errorf("cassandra session is nil")
	}

	query := `SELECT DISTINCT tournament_id FROM matches_by_tournament`
	iter := c.session.Query(query).Iter()

	var tournaments []map[string]string
	var tID string

	for iter.Scan(&tID) {
		tournaments = append(tournaments, map[string]string{
			"id":   tID,
			"name": "Tournament " + tID, // Basic fallback since we don't store tournament_name yet
		})
	}

	if err := iter.Close(); err != nil {
		return nil, fmt.Errorf("failed to fetch tournaments: %w", err)
	}

	return tournaments, nil
}
