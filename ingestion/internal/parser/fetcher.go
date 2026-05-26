package parser

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type Fetcher struct {
	Client  *http.Client
	BaseURL string
	APIKey  string
}


func NewFetcher(baseURL, apiKey string) *Fetcher {
	return &Fetcher{
		Client: &http.Client{
			Timeout: 10 * time.Second,
		},
		BaseURL: baseURL,
		APIKey:  apiKey,
	}
}


func (f *Fetcher) FetchData(endpoint string, target interface{}) error {
	url := fmt.Sprintf("%s/%s", f.BaseURL, endpoint)
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	if f.APIKey != "" {
	
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", f.APIKey))
	}

	resp, err := f.Client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("API returned non-success status: %d", resp.StatusCode)
	}

	if err := json.NewDecoder(resp.Body).Decode(target); err != nil {
		return fmt.Errorf("failed to decode response JSON: %w", err)
	}

	return nil
}
