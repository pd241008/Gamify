.PHONY: all build clean test tidy run

# Binary name
BIN_NAME = ingest-bin

# Build directory
CMD_DIR = ./cmd/ingestion

all: build

build:
	@echo "Building $(BIN_NAME)..."
	go build -o $(BIN_NAME) $(CMD_DIR)
	@echo "Build complete! Run 'make run' to start the server."

run: build
	@echo "Running $(BIN_NAME)..."
	./$(BIN_NAME)

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
