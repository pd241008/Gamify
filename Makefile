.PHONY: all build clean test tidy run

all: build

build:
	@echo "Building ingestion service..."
	$(MAKE) -C ingestion build

run: build
	@echo "Running ingestion service..."
	$(MAKE) -C ingestion run

dev:
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
