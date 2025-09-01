# Production Deployment Guide

## Prerequisites
- Docker and Docker Compose installed on your server
- Git installed to clone the repository

## Deployment Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Build and start the production services:
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

3. The application will be available at `http://your-server-ip:5002`

## Configuration

- Environment variables are set in `.env.prod`
- The production Dockerfile uses Gunicorn as the WSGI server
- The service will automatically restart unless stopped manually

## Stopping the Service

To stop the service:
```bash
docker-compose -f docker-compose.prod.yml down
```