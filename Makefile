.PHONY: all build clean test tidy run

all: build

build:
	@echo "Building ingestion service..."
	$(MAKE) -C ingestion build

run: build
	@echo "Running ingestion service..."
	$(MAKE) -C ingestion run

dev:
	@echo "Stopping past processes..."
	-@pkill -f "next dev" 2>/dev/null || true
	-@pkill -f "ingest-bin" 2>/dev/null || true
	@echo "Starting backend and frontend together..."
	npx concurrently -k -n "backend,frontend" -c "green,blue" "make -C ingestion run" "npm --prefix frontend run dev"

test:
	@echo "Running tests..."
	$(MAKE) -C ingestion test

clean:
	@echo "Cleaning up..."
	$(MAKE) -C ingestion clean

tidy:
	@echo "Tidying module..."
	$(MAKE) -C ingestion tidy
