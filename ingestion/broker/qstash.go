package broker

import (
	"fmt"
	"ingestion/internal/qstash"
	"log"
	"time"
)

type MatchNotificationPayload struct {
	MatchID      string `json:"match_id"`
	MatchName    string `json:"match_name"`
	TournamentID string `json:"tournament_id"`
	Status       string `json:"status"`
	ScheduledAt  string `json:"scheduled_at"`
	TeamA        string `json:"team_a,omitempty"`
	TeamB        string `json:"team_b,omitempty"`
	TeamAName    string `json:"team_a_name,omitempty"`
	TeamBName    string `json:"team_b_name,omitempty"`
	TeamALogo    string `json:"team_a_logo,omitempty"`
	TeamBLogo    string `json:"team_b_logo,omitempty"`
	Videogame    string `json:"videogame"`
}

type Broker struct {
	client     *qstash.Client
	webhookURL string
}

func NewBroker(client *qstash.Client, webhookURL string) (*Broker, error) {
	if client == nil {
		return nil, fmt.Errorf("QStash client is required")
	}
	if webhookURL == "" {
		return nil, fmt.Errorf("webhook URL is required")
	}

	return &Broker{
		client:     client,
		webhookURL: webhookURL,
	}, nil
}

func (b *Broker) ScheduleMatchNotification(matchStartTime time.Time, payload MatchNotificationPayload) (string, error) {
	// Calculate the delay: deliver at T-15 minutes before match start.
	notifyAt := matchStartTime.Add(-15 * time.Minute)
	delay := time.Until(notifyAt)

	// If the notification time has already passed, deliver immediately.
	if delay < 0 {
		log.Printf("⚠️  Match %s notification time has passed (was %s), delivering immediately",
			payload.MatchID, notifyAt.Format(time.RFC3339))
		delay = 0
	}

	// Use match ID as a deduplication key to prevent duplicate notifications
	// across multiple ingestion runs.
	deduplicationID := fmt.Sprintf("match-notify-%s", payload.MatchID)

	resp, err := b.client.Publish(qstash.PublishRequest{
		Destination:     b.webhookURL,
		Body:            payload,
		Delay:           delay,
		DeduplicationID: deduplicationID,
		Retries:         3,
	})
	if err != nil {
		return "", fmt.Errorf("failed to schedule notification for match %s: %w", payload.MatchID, err)
	}

	log.Printf("✅ Notification scheduled for match %s | deliver at %s (delay: %s) | QStash messageId: %s",
		payload.MatchID, notifyAt.Format(time.RFC3339), delay.Round(time.Second), resp.MessageID)

	return resp.MessageID, nil
}
