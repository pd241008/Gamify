package parser

import (
	"fmt"
)

// Match represents a basic esports match data structure.
type Match struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Status      string `json:"status"`
	ScheduledAt string `json:"scheduled_at"`
	League      League `json:"league"`
}

// League represents the league/tournament the match belongs to.
type League struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// EsportsParser orchestrates the fetching and parsing of esports data.
type EsportsParser struct {
	fetcher *Fetcher
}

// NewEsportsParser initializes a new parser with a given fetcher.
func NewEsportsParser(fetcher *Fetcher) *EsportsParser {
	return &EsportsParser{
		fetcher: fetcher,
	}
}

// GetUpcomingMatches fetches upcoming matches from the esports API.
func (p *EsportsParser) GetUpcomingMatches() ([]Match, error) {
	var matches []Match
	
	// Assuming "matches/upcoming" is the standard endpoint for the third-party API.
	// You may need to adjust this endpoint based on the specific API you are using (e.g. PandaScore).
	err := p.fetcher.FetchData("matches/upcoming", &matches)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch upcoming matches: %w", err)
	}

	return matches, nil
}
