package astra

import (
	"fmt"
	"log"
	"net/http"

	internalastra "ingestion/internal/astra"
)

func astraconnection(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Creating the cluster now")
	
	version, elapsed, err := internalastra.ConnectAndQuery()
	if err != nil {
		log.Printf("Error connecting to Astra DB: %v", err)
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	fmt.Println(version)
	fmt.Printf("Connection process took %s\n", elapsed)
	fmt.Fprintf(w, "Connected successfully. DB Version: %s", version)
}
