# Warehouse KIOT Backend

A FastAPI-based backend service for warehouse management system.

## Tech Stack

- **FastAPI**: Modern web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **PostgreSQL**: Database (via asyncpg)
- **Redis**: Caching and message broker
- **Celery**: Distributed task queue
- **Docker**: Containerization
- **Alembic**: Database migrations

## Prerequisites

- Python 3.8+
- Docker and Docker Compose
- PostgreSQL
- Redis

## Project Structure

```
backend/
├── api/          # API endpoints and routes
├── core/         # Core application logic
├── worker/       # Celery worker tasks
├── .env          # Environment variables
├── Dockerfile    # Docker configuration
├── docker-compose.yml
└── requirements.txt
```

## Getting Started

1. Clone the repository

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Run with Docker:
   ```bash
   docker-compose up -d
   ```

   Or run locally:
   ```bash
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Run migrations
   alembic upgrade head
   
   # Start the server
   uvicorn api.main:app --reload
   ```

4. Access the API documentation:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## Development

### Running Tests
```bash
pytest
```

### Database Migrations
```bash
# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

### Environment Variables

Key environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `SECRET_KEY`: JWT secret key
- `ENVIRONMENT`: Development/staging/production

## API Documentation

The API documentation is automatically generated and available at:
- `/docs` - Swagger UI
- `/redoc` - ReDoc

## License

This project is proprietary and confidential.
