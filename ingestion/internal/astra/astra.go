package astra

import (
	"fmt"
	"time"

	gocqlastra "github.com/datastax/gocql-astra"
	"github.com/gocql/gocql"
)

// NewSession creates a reusable Cassandra session connected to Astra DB.
// The caller is responsible for closing the session when done (via session.Close()).
func NewSession(token, dbID string) (*gocql.Session, error) {
	if token == "" {
		return nil, fmt.Errorf("Astra DB token is required")
	}
	if dbID == "" {
		return nil, fmt.Errorf("Astra DB ID is required")
	}

	cluster, err := gocqlastra.NewClusterFromURL(
		"https://api.astra.datastax.com",
		dbID,
		token,
		10*time.Second,
	)
	if err != nil {
		return nil, fmt.Errorf("unable to configure Astra DB cluster: %w", err)
	}

	session, err := gocql.NewSession(*cluster)
	if err != nil {
		return nil, fmt.Errorf("unable to connect to Astra DB: %w", err)
	}

	return session, nil
}

// HealthCheck verifies the Astra DB connection by querying the Cassandra version.
// Returns the release version string and the time it took to connect + query.
func HealthCheck(token, dbID string) (string, time.Duration, error) {
	start := time.Now()

	session, err := NewSession(token, dbID)
	if err != nil {
		return "", time.Since(start), err
	}
	defer session.Close()

	elapsed := time.Since(start)

	iter := session.Query("SELECT release_version FROM system.local").Iter()

	var version string
	var finalVersion string
	for iter.Scan(&version) {
		finalVersion = version
	}

	if err = iter.Close(); err != nil {
		return "", elapsed, fmt.Errorf("error running health check query: %w", err)
	}

	return finalVersion, elapsed, nil
}
