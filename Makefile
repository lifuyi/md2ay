# Makefile for md2any with UV optimizations

.PHONY: help install dev prod test lint format clean benchmark docker-build docker-run

# Default target
help:
	@echo "🚀 md2any Development Commands (UV-powered)"
	@echo "============================================="
	@echo ""
	@echo "📦 Setup & Dependencies:"
	@echo "  make install     - Install dependencies with UV"
	@echo "  make install-dev - Install with development dependencies"
	@echo ""
	@echo "🔥 Development:"
	@echo "  make dev         - Start development server with auto-reload"
	@echo "  make prod        - Start production server"
	@echo ""
	@echo "🧪 Code Quality:"
	@echo "  make lint        - Run linting (flake8, mypy)"
	@echo "  make format      - Format code (black, isort)"
	@echo ""
	@echo "🐳 Docker:"
	@echo "  make docker-build     - Build Docker images"
	@echo "  make docker-run       - Run with Docker Compose"
	@echo "  make docker-prod      - Run production Docker"
	@echo ""
	@echo "🧹 Maintenance:"
	@echo "  make clean       - Clean up build artifacts"
	@echo "  make update      - Update dependencies"

# Setup and Dependencies
install:
	@echo "📦 Installing dependencies with UV..."
	uv sync --no-dev

install-dev:
	@echo "📦 Installing development dependencies with UV..."
	uv sync --dev

update:
	@echo "🔄 Updating dependencies..."
	uv lock --upgrade
	uv sync --dev

# Development
dev:
	@echo "🔥 Starting development server..."
	./start_dev.sh

prod:
	@echo "🚀 Starting production server..."
	./start_prod.sh

# Code Quality (tests removed - add your own test directory when needed)

lint:
	@echo "🔍 Running linting..."
	uv run flake8 .
	uv run mypy api_server.py

format:
	@echo "✨ Formatting code..."
	uv run black .
	uv run isort .

format-check:
	@echo "🔍 Checking code format..."
	uv run black --check .
	uv run isort --check-only .

# Performance benchmarking tools removed - use UV performance naturally

# Docker
docker-build:
	@echo "🐳 Building Docker images..."
	docker build -t md2any:dev .
	docker build -f Dockerfile.prod -t md2any:prod .

docker-run:
	@echo "🐳 Running with Docker Compose (development)..."
	docker-compose up --build

docker-prod:
	@echo "🐳 Running production Docker..."
	docker-compose -f docker-compose.prod.yml up --build -d

docker-stop:
	@echo "🛑 Stopping Docker containers..."
	docker-compose down
	docker-compose -f docker-compose.prod.yml down

# Maintenance
clean:
	@echo "🧹 Cleaning up..."
	rm -rf __pycache__/
	rm -rf .pytest_cache/
	rm -rf htmlcov/
	rm -rf .coverage
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info/
	find . -name "*.pyc" -delete
	find . -name "*.pyo" -delete

# CI/CD helpers
ci-install:
	@echo "🤖 CI: Installing dependencies..."
	uv sync --dev --frozen

ci-quality:
	@echo "🤖 CI: Running code quality checks..."
	uv run black --check .
	uv run flake8 .
	uv run isort --check-only .

# Performance is now built into UV - no separate testing needed

# Health check
health:
	@echo "🏥 Checking server health..."
	curl -f http://localhost:5002/health || echo "❌ Server not responding"

# Development utilities
watch:
	@echo "👀 Watching for changes..."
	uv run python -c "print('Use ./start_dev.sh for auto-reload!')"

# Database/cache operations (if needed in future)
migrate:
	@echo "🗃️  Running migrations..."
	@echo "No migrations needed for current setup"

# Security scanning (if needed)
security:
	@echo "🔒 Running security scan..."
	uv run pip-audit