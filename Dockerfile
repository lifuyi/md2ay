FROM --platform=$TARGETPLATFORM python:3.11-alpine

ARG TARGETPLATFORM
ARG BUILDPLATFORM

WORKDIR /app

# Install UV for ultra-fast dependency management
RUN pip install uv

# Copy dependency files for UV
COPY pyproject.toml uv.lock* ./

# Install dependencies with UV (much faster than pip)
RUN apk add --no-cache --virtual .build-deps gcc musl-dev && \
    uv sync --dev --no-install-project && \
    apk del .build-deps

# Copy application files
COPY api_server.py .
COPY frontend.html .
COPY frontend.js .
COPY wxcss.py .

# Copy all CSS themes including new Chinese news themes
COPY themes/*.css ./themes/

# Copy documentation
COPY *.md ./

EXPOSE 5002

# Set development environment
ENV FLASK_ENV=development
ENV PYTHONUNBUFFERED=1

CMD ["uv", "run", "python", "api_server.py", "--dev"]