# Warehouse KIOT Backend

A FastAPI-based backend service for a warehouse management system, designed for scalability and maintainability.

## Overview

This backend service provides the core API functionalities for managing warehouse operations, including inventory tracking, item management, user authentication, and integration with external services. It is built with a modern Python stack, leveraging asynchronous programming for high performance.

## Tech Stack

- **Framework**: FastAPI
- **ORM**: SQLAlchemy (with asyncpg for PostgreSQL)
- **Database**: PostgreSQL
- **Caching**: Redis
- **Task Queue**: Celery (with Redis as broker)
- **Containerization**: Docker, Docker Compose
- **Database Migrations**: Alembic
- **Testing**: Pytest

## Prerequisites

Before you begin, ensure you have the following installed:

- Python 3.8 or higher
- Docker Engine (latest stable version)
- Docker Compose (latest stable version)
- PostgreSQL client tools (optional, for direct database access)
- Redis client tools (optional, for direct Redis access)

## Project Structure

```
backend/
├── .github/            # GitHub Actions workflows (if any)
├── .pytest_cache/      # Pytest cache (add to .gitignore)
├── api/                # FastAPI application, modules, routes, and controllers
│   ├── main.py         # Main FastAPI application instance
│   └── modules/        # Feature modules (e.g., user, item, warehouse)
├── core/               # Core application logic, services, database, utilities
│   ├── config.py       # Application configuration
│   ├── database.py     # Database session management
│   ├── exceptions.py   # Custom exceptions
│   └── security.py     # Authentication and authorization logic
├── tests/              # Global test configurations and utilities (if any)
├── worker/             # Celery worker tasks and configuration
├── .env.example        # Example environment variables file
├── .gitignore          # Specifies intentionally untracked files that Git should ignore
├── alembic.ini         # Alembic configuration file
├── alembic/            # Alembic migration scripts
├── docker-compose.yml  # Docker Compose configuration for services
├── Dockerfile          # Dockerfile for building the application image
├── pyproject.toml      # Project metadata and pytest configuration
├── README.md           # This file
└── requirements.txt    # Python package dependencies
```

## Getting Started

Follow these instructions to get the backend service up and running.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd backend
```

### 2. Set Up Environment Variables

Copy the example environment file and customize it with your settings:

```bash
cp .env.example .env
```

Edit the `.env` file with your specific configurations for:
- `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql+asyncpg://user:password@host:port/dbname`)
- `REDIS_URL`: Redis connection string (e.g., `redis://host:port/0`)
- `SECRET_KEY`: A strong secret key for JWT and other security features. Generate one using `openssl rand -hex 32`.
- `ENVIRONMENT`: Application environment (e.g., `development`, `staging`, `production`).
- `CELERY_BROKER_URL`: Celery broker URL (usually same as `REDIS_URL`).
- `CELERY_RESULT_BACKEND`: Celery result backend URL (usually same as `REDIS_URL`).
- Other service-specific API keys or settings.

### 3. Installation and Running the Application

You can run the application using Docker (recommended for consistency across environments) or locally for development.

#### Option A: Using Docker (Recommended)

This method uses Docker Compose to build images and run all services (app, database, Redis, worker).

1.  **Build and Start Containers:**
    ```bash
    docker compose up --build -d
    ```
    The `-d` flag runs the containers in detached mode.

2.  **Apply Database Migrations (if first time or new migrations):**
    Open a new terminal and run:
    ```bash
    docker compose exec app alembic upgrade head
    ```

3.  **Accessing the Application:**
    - API: `http://localhost:8000` (or the port configured in `docker-compose.yml` and `.env`)
    - Swagger UI: `http://localhost:8000/docs`
    - ReDoc: `http://localhost:8000/redoc`

4.  **Stopping the Application:**
    ```bash
    docker compose down
    ```
    To stop and remove volumes (database data, etc.):
    ```bash
    docker compose down -v
    ```

#### Option B: Running Locally (for Development)

1.  **Set up a Virtual Environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: .\venv\Scripts\activate
    ```

2.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Ensure PostgreSQL and Redis are Running:**
    Make sure you have PostgreSQL and Redis instances running and accessible, and their connection details match your `.env` file.

4.  **Apply Database Migrations:**
    ```bash
    alembic upgrade head
    ```

5.  **Start the FastAPI Application:**
    ```bash
    uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
    ```
    The `--reload` flag enables auto-reloading for development.

6.  **Start the Celery Worker (in a separate terminal):**
    ```bash
    celery -A worker.celery_app worker --loglevel=info
    ```

## Development Workflow

### Running Tests

Comprehensive testing is crucial. We use `pytest` for unit and integration tests.

#### Running All Tests:

-   **Locally:**
    Ensure your virtual environment is activated and all dependencies (including dev dependencies if you have a `requirements-dev.txt`) are installed.
    ```bash
    pytest
    ```
    Or, to include verbose output:
    ```bash
    pytest -v
    ```

-   **Using Docker Compose:**
    This ensures tests run in an environment identical to CI/CD and production.
    ```bash
    docker compose exec app pytest . -v
    ```

#### Running Specific Tests:

You can specify a path to a test file or directory, or use pytest markers.

-   **Locally:**
    ```bash
    # Run tests in a specific file
    pytest api/modules/user/test/test_user_service.py -v

    # Run tests in a specific directory
    pytest api/modules/item_unit/test/ -v

    # Run tests matching a keyword
    pytest -k "create_item_unit" -v

    # Run tests with a specific marker (e.g., @pytest.mark.slow)
    pytest -m slow -v
    ```

-   **Using Docker Compose:**
    ```bash
    # Run tests in a specific file
    docker compose exec app pytest api/modules/user/test/test_user_service.py -v

    # Run tests in a specific directory
    docker compose exec app pytest api/modules/item_unit/test/ -v
    ```
    The command you previously used is also valid:
    ```bash
    docker compose exec app pytest api/modules/item_unit/test/ api/modules/warehouse_inventory/test/ -v
    ```

### Database Migrations (Alembic)

Manage database schema changes using Alembic.

1.  **Create a New Migration:**
    After making changes to your SQLAlchemy models:
    ```bash
    # If running locally:
    alembic revision --autogenerate -m "Your descriptive migration message"

    # If using Docker:
    docker compose exec app alembic revision --autogenerate -m "Your descriptive migration message"
    ```
    Review the generated migration script in the `alembic/versions/` directory.

2.  **Apply Migrations:**
    ```bash
    # If running locally:
    alembic upgrade head

    # If using Docker:
    docker compose exec app alembic upgrade head
    ```

3.  **Downgrade Migrations (if necessary):**
    ```bash
    # Downgrade one step
    alembic downgrade -1

    # Downgrade to a specific revision
    alembic downgrade <revision_hash>
    ```

### Linting and Formatting

(Add instructions here if you use tools like Black, Flake8, isort, etc. For example:)
```bash
# Example for Black and Flake8
pip install black flake8
black .
flake8 .
```

### Environment Variables

Key environment variables are managed in the `.env` file (see "Set Up Environment Variables" section).
Common variables include:
- `DATABASE_URL`
- `REDIS_URL`
- `SECRET_KEY`
- `ENVIRONMENT` (e.g., `development`, `production`)
- `CELERY_BROKER_URL`
- `CELERY_RESULT_BACKEND`

Ensure these are correctly set for your environment.

## API Documentation

The API documentation is automatically generated by FastAPI and available at:

-   **Swagger UI**: `http://localhost:8000/docs`
-   **ReDoc**: `http://localhost:8000/redoc`

These interfaces allow you to explore and interact with the API endpoints.

## Contributing

We welcome contributions! Please follow these guidelines:
(Customize this section based on your project's contribution policy)
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Create a new Pull Request.

Please ensure your code adheres to the project's coding standards and all tests pass.

## Support and Contact

If you encounter any issues or have questions, please:
1. Check the existing GitHub Issues.
2. Create a new issue if your problem is not already reported.
(Add other contact methods if applicable, e.g., a Slack channel or email address)

## License

This project is proprietary and confidential.
