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
    start_time timestamp,
    match_id text,
    status text,
    score text,
    team_a text,
    team_b text,
    PRIMARY KEY ((tournament_id), start_time, match_id)
) WITH CLUSTERING ORDER BY (start_time DESC);
`

// EnsureSchema creates the matches_by_tournament table if it does not already exist.
// It should be called once during application startup after establishing a Cassandra session.
func EnsureSchema(session *gocql.Session) error {
	if session == nil {
		return fmt.Errorf("cassandra session is nil")
	}

	if err := session.Query(createMatchesTableCQL).Exec(); err != nil {
		return fmt.Errorf("failed to create matches_by_tournament table: %w", err)
	}

	return nil
}

// FetchAllMatches retrieves up to 50 matches for the frontend API.
func FetchAllMatches(session *gocql.Session) ([]map[string]interface{}, error) {
	if session == nil {
		return nil, fmt.Errorf("cassandra session is nil")
	}

	// LIMIT 50 is used for demonstration, allowing across-partition queries in Astra DB.
	query := `SELECT tournament_id, start_time, match_id, status, score, team_a, team_b FROM matches_by_tournament LIMIT 50`
	iter := session.Query(query).Iter()

	var matches []map[string]interface{}
	var tID, mID, status, score, teamA, teamB string
	var startTime time.Time

	for iter.Scan(&tID, &startTime, &mID, &status, &score, &teamA, &teamB) {
		name := teamA + " vs " + teamB
		if teamA == "" && teamB == "" {
			name = "TBD vs TBD"
		}
		
		matches = append(matches, map[string]interface{}{
			"id":          mID,
			"name":        name,
			"tournament":  "Tournament " + tID, // Prefix for display
			"status":      status,
			"scheduledAt": startTime.Format("2006-01-02T15:04:05Z07:00"),
			"score":       score,
			"teamA": map[string]string{
				"name": teamA,
			},
			"teamB": map[string]string{
				"name": teamB,
			},
		})
	}

	if err := iter.Close(); err != nil {
		return nil, fmt.Errorf("failed to fetch all matches: %w", err)
	}

	return matches, nil
}
