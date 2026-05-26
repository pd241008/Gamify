package astra

import (
	"fmt"
	"os"
	"time"

	gocqlastra "github.com/datastax/gocql-astra"
	"github.com/gocql/gocql"
)

func ConnectAndQuery() (string, time.Duration, error) {
	var cluster *gocql.ClusterConfig
	var err error

	if len(os.Getenv("ASTRA_DB_APPLICATION_TOKEN")) > 0 {
		if len(os.Getenv("ASTRA_DB_ID")) == 0 {
			return "", 0, fmt.Errorf("database ID is required when using a token")
		}
	}

	cluster, err = gocqlastra.NewClusterFromURL("https://api.astra.datastax.com", os.Getenv("ASTRA_DB_ID"), os.Getenv("ASTRA_DB_APPLICATION_TOKEN"), 10*time.Second)
	if err != nil {
		return "", 0, fmt.Errorf("unable to load cluster %s from astra: %v", os.Getenv("ASTRA_DB_APPLICATION_TOKEN"), err)
	}

	start := time.Now()
	session, err := gocql.NewSession(*cluster)
	elapsed := time.Since(start)

	if err != nil {
		return "", elapsed, fmt.Errorf("unable to connect session: %v", err)
	}
	defer session.Close()

	iter := session.Query("SELECT release_version FROM system.local").Iter()

	var version string
	var finalVersion string

	for iter.Scan(&version) {
		finalVersion = version
	}

	if err = iter.Close(); err != nil {
		return "", elapsed, fmt.Errorf("error running query: %v", err)
	}

	return finalVersion, elapsed, nil
}
