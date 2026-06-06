.PHONY: all build clean test tidy run run-local env-check

# Binary name
BIN_NAME = ingest-bin

# Build directory
CMD_DIR = ./api

# .env file path (relative to project root)
ENV_FILE = ../.env

all: build

build:
	@echo "Building $(BIN_NAME)..."
	go build -o $(BIN_NAME) $(CMD_DIR)
	@echo "Build complete! Run 'make run' to start the server."

run: build
	@echo "Running $(BIN_NAME)..."
	./$(BIN_NAME)

# Run locally with .env variables loaded
run-local: build
	@echo "Loading environment from $(ENV_FILE)..."
	@set -a && [ -f $(ENV_FILE) ] && . $(ENV_FILE); set +a && ./$(BIN_NAME)

test:
	@echo "Running tests..."
	go test -v ./...

clean:
	@echo "Cleaning up..."
	rm -f $(BIN_NAME)
	go clean

tidy:
	@echo "Tidying module..."
	go mod tidy

# Print which required env vars are set (values are redacted)
env-check:
	@echo "Checking required environment variables..."
	@for var in ESPORTS_API_BASE_URL ESPORTS_API_KEY ASTRA_DB_TOKEN ASTRA_DB_ID QSTASH_URL QSTASH_TOKEN WEBHOOK_URL; do \
		if [ -n "$$(eval echo \$$$$var)" ]; then \
			echo "  ✅ $$var is set"; \
		else \
			echo "  ❌ $$var is NOT set"; \
		fi \
	done
