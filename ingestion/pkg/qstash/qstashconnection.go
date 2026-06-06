package qstash

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Client manages authenticated HTTP communication with the Upstash QStash API.
type Client struct {
	baseURL    string
	token      string
	httpClient *http.Client
}

// NewClient creates a new QStash Client from the provided URL and token.
// These values should come from the centralized config — no env vars are read here.
//
// baseURL: the QStash API endpoint (e.g., "https://qstash-eu-central-1.upstash.io").
// token:   the QStash bearer token for authentication.
func NewClient(baseURL, token string) (*Client, error) {
	if baseURL == "" {
		return nil, fmt.Errorf("QStash base URL is required")
	}
	if token == "" {
		return nil, fmt.Errorf("QStash token is required")
	}

	return &Client{
		baseURL: baseURL,
		token:   token,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}, nil
}

// PublishRequest represents the parameters for publishing a message to QStash.
type PublishRequest struct {
	// Destination is the webhook URL that QStash will deliver the message to.
	Destination string
	// Body is the JSON-serializable payload to deliver.
	Body interface{}
	// Delay is the duration QStash should wait before delivering the message.
	// Use this to schedule delivery at a future time (e.g., T-15 min before match start).
	Delay time.Duration
	// DeduplicationID is an optional unique key to prevent duplicate message delivery.
	DeduplicationID string
	// Retries is the number of retry attempts QStash should make on delivery failure.
	// Default (0) uses QStash's server-side default (typically 3).
	Retries int
}

// PublishResponse represents the response from a successful QStash publish.
type PublishResponse struct {
	MessageID string `json:"messageId"`
}

// Publish sends a message to QStash for delayed delivery to the specified destination URL.
// QStash will hold the message for the configured delay duration, then POST it to the destination.
func (c *Client) Publish(req PublishRequest) (*PublishResponse, error) {
	if req.Destination == "" {
		return nil, fmt.Errorf("destination URL is required")
	}

	// Serialize the payload body to JSON.
	var bodyReader io.Reader
	if req.Body != nil {
		bodyBytes, err := json.Marshal(req.Body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal message body: %w", err)
		}
		bodyReader = bytes.NewReader(bodyBytes)
	}

	// QStash publish endpoint: POST /v2/publish/{destination}
	url := fmt.Sprintf("%s/v2/publish/%s", c.baseURL, req.Destination)

	httpReq, err := http.NewRequest(http.MethodPost, url, bodyReader)
	if err != nil {
		return nil, fmt.Errorf("failed to create HTTP request: %w", err)
	}

	// Set authentication and content headers.
	httpReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.token))
	httpReq.Header.Set("Content-Type", "application/json")

	// Set the delivery delay header if a delay is specified.
	if req.Delay > 0 {
		delaySec := int(req.Delay.Seconds())
		httpReq.Header.Set("Upstash-Delay", fmt.Sprintf("%ds", delaySec))
	}

	// Set optional deduplication ID to prevent duplicate deliveries.
	if req.DeduplicationID != "" {
		httpReq.Header.Set("Upstash-Deduplication-Id", req.DeduplicationID)
	}

	// Set retry count if explicitly specified.
	if req.Retries > 0 {
		httpReq.Header.Set("Upstash-Retries", fmt.Sprintf("%d", req.Retries))
	}

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("QStash publish request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read QStash response body: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("QStash returned HTTP %d: %s", resp.StatusCode, string(respBody))
	}

	var publishResp PublishResponse
	if err := json.Unmarshal(respBody, &publishResp); err != nil {
		return nil, fmt.Errorf("failed to decode QStash response: %w", err)
	}

	return &publishResp, nil
}
