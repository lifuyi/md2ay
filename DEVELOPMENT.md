# Development Guide for md2any

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repository>
cd md2any

# Start development (automatic setup)
./start_dev.sh

# Or use Makefile
make dev
```

## 🛠️ Development Tools

### UV Performance Benefits

This project uses UV for **dramatically faster** dependency management:

- **3-10x faster** than pip for installations
- **TOML-based** configuration with `pyproject.toml`
- **Lock files** for reproducible builds
- **No activation** needed with `uv run`

### Available Commands

```bash
# Development server with auto-reload
make dev                 # or ./start_dev.sh

# Production server
make prod               # or ./start_prod.sh

# Testing
make test               # Run tests
make test-coverage      # Tests with coverage report
make benchmark          # Performance benchmarks

# Code quality
make format             # Format with black & isort
make lint               # Lint with flake8 & mypy
make format-check       # Check formatting

# Docker
make docker-build       # Build images
make docker-run         # Development with Docker
make docker-prod        # Production with Docker

# Maintenance
make clean              # Clean build artifacts
make update             # Update dependencies
```

## 🏗️ Project Structure

```
md2any/
├── api_server.py           # Main Flask application
├── frontend.html           # Web interface
├── frontend.js             # Frontend JavaScript
├── wxcss.py               # CSS processing utilities
├── pyproject.toml         # Dependencies & config
├── uv.lock               # Lock file for reproducible builds
├── start_dev.sh          # Development startup
├── start_prod.sh         # Production startup
├── themes/               # CSS themes
├── tests/                # Test suite
├── .github/workflows/    # CI/CD pipeline
└── docs/                 # Documentation
```

## 🧪 Testing

### Running Tests

```bash
# Basic test run
make test

# With coverage
make test-coverage

# Specific test file
uv run pytest tests/test_basic.py -v

# Run single test
uv run pytest tests/test_basic.py::test_health_check -v
```

### Writing Tests

Tests are located in the `tests/` directory. Example:

```python
def test_new_feature(client):
    """Test a new feature."""
    response = client.get('/new-endpoint')
    assert response.status_code == 200
    assert b'expected_content' in response.data
```

## 🎨 Code Style

The project uses consistent code formatting:

- **Black** for code formatting
- **isort** for import sorting
- **flake8** for linting
- **mypy** for type checking

```bash
# Format code
make format

# Check formatting
make format-check

# Run linting
make lint
```

## 🐳 Docker Development

### Development Container

```bash
# Build and run development container
make docker-run

# Or manually
docker-compose up --build
```

### Production Container

```bash
# Run production container
make docker-prod

# Or manually
docker-compose -f docker-compose.prod.yml up --build
```

### Multi-architecture Builds

```bash
# Build for multiple platforms
docker buildx build --platform linux/amd64,linux/arm64 -t md2any:latest .
```

## 🔧 Environment Variables

### Development
- `FLASK_ENV=development` - Enable debug mode
- `PYTHONUNBUFFERED=1` - Immediate stdout/stderr

### Production
- `FLASK_ENV=production` - Production mode
- `PYTHONOPTIMIZE=1` - Optimize Python bytecode
- `PYTHONDONTWRITEBYTECODE=1` - Don't write .pyc files
- `WECHAT_APPID` - WeChat integration
- `WECHAT_SECRET` - WeChat secret

## 📊 Performance Monitoring

### Benchmarking

```bash
# Full performance test
make benchmark

# UV vs pip comparison
./test_performance.sh

# Custom benchmark
python benchmark.py
```

### Profiling

For performance profiling, you can use:

```bash
# Profile with cProfile
uv run python -m cProfile -o profile.stats api_server.py

# Analyze with snakeviz
uv add snakeviz
uv run snakeviz profile.stats
```

## 🚀 Deployment

### Local Production

```bash
# Using startup script
./start_prod.sh

# Using Makefile
make prod

# Using Docker
make docker-prod
```

### CI/CD Pipeline

The project includes GitHub Actions for:

- **Testing** across Python 3.8.1-3.12
- **Linting** and code quality checks
- **Docker builds** with multi-architecture support
- **Performance benchmarks**
- **Automated deployment**

### Production Checklist

- [ ] Environment variables configured
- [ ] Health checks working (`/health` endpoint)
- [ ] Performance benchmarks passing
- [ ] Security scan clean
- [ ] Docker image built and tested
- [ ] Monitoring configured

## 🐛 Debugging

### Development Debugging

```bash
# Start with debug logging
FLASK_DEBUG=1 ./start_dev.sh

# Use Python debugger
import pdb; pdb.set_trace()
```

### Docker Debugging

```bash
# Access running container
docker exec -it md2any bash

# View logs
docker logs md2any -f

# Debug build issues
docker build --no-cache -t md2any:debug .
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Install** dev dependencies: `make install-dev`
4. **Make** changes and add tests
5. **Format** code: `make format`
6. **Run** tests: `make test`
7. **Commit** changes: `git commit -m 'Add amazing feature'`
8. **Push** branch: `git push origin feature/amazing-feature`
9. **Open** Pull Request

### Code Review Checklist

- [ ] Tests added/updated
- [ ] Code formatted (`make format`)
- [ ] Linting passes (`make lint`)
- [ ] Performance impact assessed
- [ ] Documentation updated
- [ ] Backward compatibility maintained

## 📝 Release Process

1. Update version in `pyproject.toml`
2. Update `CHANGELOG.md`
3. Run full test suite: `make ci-test`
4. Tag release: `git tag v1.x.x`
5. Push tags: `git push --tags`
6. GitHub Actions handles the rest

## 🆘 Troubleshooting

### Common Issues

**UV not found:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.cargo/env
```

**Port 5002 in use:**
```bash
# Find and kill process
lsof -ti:5002 | xargs kill -9
```

**Docker build fails:**
```bash
# Clean Docker cache
docker system prune -a
```

**Dependencies conflict:**
```bash
# Update lock file
uv lock --upgrade
```

### Getting Help

- Check [UV_PERFORMANCE.md](UV_PERFORMANCE.md) for benchmarks
- Review [README.md](README.md) for setup instructions
- Open issue on GitHub for bugs
- Join discussions for questions