package db

import (
	"fmt"
	"ingestion/pkg/parser"
	"time"
)

// FetchExistingMatches queries Cassandra for matches by tournament_id and returns a map keyed by match_id.
func (c *CassandraStore) FetchExistingMatches(tournamentID string) (map[string]parser.Match, error) {
	if c.session == nil {
		return nil, fmt.Errorf("cassandra session is nil")
	}

	matches := make(map[string]parser.Match)
	query := `SELECT tournament_id, start_time, match_id, status, score, team_a, team_b, team_a_name, team_b_name, team_a_logo, team_b_logo, videogame, league_name FROM matches_by_tournament WHERE tournament_id = ?`

	iter := c.session.Query(query, tournamentID).Iter()
	var tID, mID, status, score, teamA, teamB, teamAName, teamBName, teamALogo, teamBLogo, videogame, leagueName string
	var startTime time.Time

	for iter.Scan(&tID, &startTime, &mID, &status, &score, &teamA, &teamB, &teamAName, &teamBName, &teamALogo, &teamBLogo, &videogame, &leagueName) {
		matches[mID] = parser.Match{
			Status:      status,
			ScheduledAt: startTime,
			Score:       score,
			TeamA:       teamA,
			TeamB:       teamB,
			TeamAName:   teamAName,
			TeamBName:   teamBName,
			TeamALogo:   teamALogo,
			TeamBLogo:   teamBLogo,
			Videogame:   videogame,
			League: parser.League{
				Name: leagueName,
			},
		}
	}

	if err := iter.Close(); err != nil {
		return nil, fmt.Errorf("failed to fetch existing matches: %w", err)
	}

	return matches, nil
}

// GetDeltas compares incoming matches with existing matches to determine inserts and updates.
func GetDeltas(existing map[string]parser.Match, incoming []parser.Match) ([]parser.Match, []parser.Match) {
	var toInsert []parser.Match
	var toUpdate []parser.Match

	for _, match := range incoming {
		mID := fmt.Sprintf("%d", match.ID)
		if existingMatch, exists := existing[mID]; exists {
			// Compare relevant fields to detect an update
			if existingMatch.Status != match.Status || existingMatch.Score != match.Score {
				toUpdate = append(toUpdate, match)
			}
		} else {
			toInsert = append(toInsert, match)
		}
	}

	return toInsert, toUpdate
}

// SaveMatch inserts a new match into the Cassandra database.
func (c *CassandraStore) SaveMatch(match parser.Match) error {
	if c.session == nil {
		return fmt.Errorf("cassandra session is nil")
	}

	query := `
		INSERT INTO matches_by_tournament (tournament_id, start_time, match_id, status, score, team_a, team_b, team_a_name, team_b_name, team_a_logo, team_b_logo, videogame, league_name)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	tID := fmt.Sprintf("%d", match.TournamentID)
	mID := fmt.Sprintf("%d", match.ID)

	return c.session.Query(query, tID, match.ScheduledAt, mID, match.Status, match.Score, match.TeamA, match.TeamB, match.TeamAName, match.TeamBName, match.TeamALogo, match.TeamBLogo, match.Videogame, match.League.Name).Exec()
}

// UpdateMatch updates an existing match in the Cassandra database.
func (c *CassandraStore) UpdateMatch(match parser.Match) error {
	if c.session == nil {
		return fmt.Errorf("cassandra session is nil")
	}

	// In Cassandra, an UPDATE or INSERT with the same primary key acts as an upsert.
	query := `
		UPDATE matches_by_tournament 
		SET status = ?, score = ?, team_a = ?, team_b = ?, team_a_name = ?, team_b_name = ?, team_a_logo = ?, team_b_logo = ?, videogame = ?, league_name = ?
		WHERE tournament_id = ? AND start_time = ? AND match_id = ?
	`
	tID := fmt.Sprintf("%d", match.TournamentID)
	mID := fmt.Sprintf("%d", match.ID)

	return c.session.Query(query, match.Status, match.Score, match.TeamA, match.TeamB, match.TeamAName, match.TeamBName, match.TeamALogo, match.TeamBLogo, match.Videogame, match.League.Name, tID, match.ScheduledAt, mID).Exec()
}
