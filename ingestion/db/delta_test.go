package db

import (
	"ingestion/internal/parser"
	"testing"
	"time"
)

func TestGetDeltas(t *testing.T) {
	now := time.Now()

	existing := map[string]parser.Match{
		"100": {
			ID:          100,
			Status:      "not_started",
			Score:       "",
			ScheduledAt: now,
		},
		"200": {
			ID:          200,
			Status:      "running",
			Score:       "1-0",
			ScheduledAt: now,
		},
	}

	incoming := []parser.Match{
		// 100: No changes
		{
			ID:          100,
			Status:      "not_started",
			Score:       "",
			ScheduledAt: now,
		},
		// 200: Changed status and score
		{
			ID:          200,
			Status:      "finished",
			Score:       "2-0",
			ScheduledAt: now,
		},
		// 300: Completely new
		{
			ID:          300,
			Status:      "not_started",
			Score:       "",
			ScheduledAt: now,
		},
	}

	toInsert, toUpdate := GetDeltas(existing, incoming)

	if len(toInsert) != 1 {
		t.Errorf("expected 1 insert, got %d", len(toInsert))
	} else if toInsert[0].ID != 300 {
		t.Errorf("expected insert ID 300, got %d", toInsert[0].ID)
	}

	if len(toUpdate) != 1 {
		t.Errorf("expected 1 update, got %d", len(toUpdate))
	} else if toUpdate[0].ID != 200 {
		t.Errorf("expected update ID 200, got %d", toUpdate[0].ID)
	}
}
