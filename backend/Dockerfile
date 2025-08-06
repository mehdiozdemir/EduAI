# Backend için multi-stage Dockerfile
FROM python:3.11-slim as base

# uv kurulumu
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

# Çalışma dizini oluştur
WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Python environment
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV UV_CACHE_DIR=/tmp/uv-cache

# Copy pyproject.toml first for better caching
COPY pyproject.toml ./

# Create virtual environment and install dependencies with uv
RUN --mount=type=cache,target=/tmp/uv-cache \
    uv venv /opt/venv

# Activate virtual environment
ENV VIRTUAL_ENV=/opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies using pyproject.toml
RUN --mount=type=cache,target=/tmp/uv-cache \
    uv pip install -e .

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p chroma_db logs data

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Production stage
FROM base as production

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]

# Development stage
FROM base as development

# Install development dependencies
RUN --mount=type=cache,target=/tmp/uv-cache \
    uv pip install \
    pytest>=6.2.4 \
    black>=21.7b0 \
    flake8>=3.9.2

# Run with hot reload for development
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
