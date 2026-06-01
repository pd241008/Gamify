package parser

import (
	"fmt"
	"time"
)


type Match struct {
	ID           int       `json:"id"`
	TournamentID int       `json:"tournament_id"`
	Name         string    `json:"name"`
	Status       string    `json:"status"`
	ScheduledAt  time.Time `json:"scheduled_at"`
	Score        string    `json:"score,omitempty"`
	TeamA        string    `json:"team_a,omitempty"`
	TeamB        string    `json:"team_b,omitempty"`
	TeamAName    string    `json:"team_a_name,omitempty"`
	TeamBName    string    `json:"team_b_name,omitempty"`
	TeamALogo    string    `json:"team_a_logo,omitempty"`
	TeamBLogo    string    `json:"team_b_logo,omitempty"`
	League       League    `json:"league"`
}


type League struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}


type MatchProvider interface {
	GetUpcomingMatches() ([]Match, error)
	GetRunningMatches() ([]Match, error)
}


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
	err := p.fetcher.FetchData("matches/upcoming", &matches)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch upcoming matches: %w", err)
	}

	return matches, nil
}


func (p *EsportsParser) GetRunningMatches() ([]Match, error) {
	var matches []Match

	err := p.fetcher.FetchData("matches/running", &matches)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch running matches: %w", err)
	}

	return matches, nil
}
