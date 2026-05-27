package db

import (
	"fmt"

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
