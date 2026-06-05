package parser

import (
	"encoding/json"
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
	Videogame    string    `json:"videogame,omitempty"`
}

type rawMatch struct {
	ID           int       `json:"id"`
	TournamentID int       `json:"tournament_id"`
	Name         string    `json:"name"`
	Status       string    `json:"status"`
	ScheduledAt  time.Time `json:"scheduled_at"`
	League       League    `json:"league"`
	Videogame    struct {
		Name string `json:"name"`
	} `json:"videogame"`
	Opponents    []struct {
		Opponent struct {
			ID       int    `json:"id"`
			Name     string `json:"name"`
			ImageURL string `json:"image_url"`
		} `json:"opponent"`
	} `json:"opponents"`
}

// UnmarshalJSON customizes the JSON parsing to extract Team A and Team B from the nested opponents array.
func (m *Match) UnmarshalJSON(data []byte) error {
	var raw rawMatch
	// use alias to avoid infinite recursion if we were using Match, but we're using rawMatch so it's fine.
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}

	m.ID = raw.ID
	m.TournamentID = raw.TournamentID
	m.Name = raw.Name
	m.Status = raw.Status
	m.ScheduledAt = raw.ScheduledAt
	m.League = raw.League
	m.Videogame = raw.Videogame.Name

	if len(raw.Opponents) > 0 {
		m.TeamA = fmt.Sprintf("%d", raw.Opponents[0].Opponent.ID)
		m.TeamAName = raw.Opponents[0].Opponent.Name
		m.TeamALogo = raw.Opponents[0].Opponent.ImageURL
	}
	if len(raw.Opponents) > 1 {
		m.TeamB = fmt.Sprintf("%d", raw.Opponents[1].Opponent.ID)
		m.TeamBName = raw.Opponents[1].Opponent.Name
		m.TeamBLogo = raw.Opponents[1].Opponent.ImageURL
	}

	return nil
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
