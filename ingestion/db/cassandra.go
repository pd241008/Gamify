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
    team_a_logo text,
    team_b_logo text,
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

	// Safely attempt to add new columns if table already existed without them
	_ = session.Query(`ALTER TABLE matches_by_tournament ADD team_a_logo text;`).Exec()
	_ = session.Query(`ALTER TABLE matches_by_tournament ADD team_b_logo text;`).Exec()

	return nil
}

// FetchMatches retrieves matches for the frontend API, optionally filtering by tournament.
func FetchMatches(session *gocql.Session, tournamentID string) ([]map[string]interface{}, error) {
	if session == nil {
		return nil, fmt.Errorf("cassandra session is nil")
	}

	var iter *gocql.Iter
	if tournamentID != "" {
		query := `SELECT tournament_id, start_time, match_id, status, score, team_a, team_b, team_a_logo, team_b_logo FROM matches_by_tournament WHERE tournament_id = ?`
		iter = session.Query(query, tournamentID).Iter()
	} else {
		// LIMIT 50 is used for demonstration, allowing across-partition queries in Astra DB.
		query := `SELECT tournament_id, start_time, match_id, status, score, team_a, team_b, team_a_logo, team_b_logo FROM matches_by_tournament LIMIT 50`
		iter = session.Query(query).Iter()
	}

	var matches []map[string]interface{}
	var tID, mID, status, score, teamA, teamB, teamALogo, teamBLogo string
	var startTime time.Time

	for iter.Scan(&tID, &startTime, &mID, &status, &score, &teamA, &teamB, &teamALogo, &teamBLogo) {
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
				"name":    teamA,
				"logoUrl": teamALogo,
			},
			"teamB": map[string]string{
				"name":    teamB,
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
func FetchTournaments(session *gocql.Session) ([]string, error) {
	if session == nil {
		return nil, fmt.Errorf("cassandra session is nil")
	}

	query := `SELECT DISTINCT tournament_id FROM matches_by_tournament`
	iter := session.Query(query).Iter()

	var tournaments []string
	var tID string

	for iter.Scan(&tID) {
		tournaments = append(tournaments, tID)
	}

	if err := iter.Close(); err != nil {
		return nil, fmt.Errorf("failed to fetch tournaments: %w", err)
	}

	return tournaments, nil
}
