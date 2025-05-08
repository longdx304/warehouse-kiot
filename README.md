# Warehouse Kiot Management System

This project is a comprehensive warehouse management system composed of a backend API and a frontend administration panel.

## Project Structure

The project is organized into two main components:

-   **`backend/`**: Contains the FastAPI-based backend API responsible for all business logic, data storage, and core functionalities of the warehouse management system. (See `backend/README.md` for more details)
-   **`adminfront/`**: Contains the Next.js and TypeScript-based frontend application for administrators to manage the warehouse system. (See `adminfront/README.md` for more details)

## Overview

### Backend (`backend/`)

The backend is a robust API built with Python and FastAPI. It handles:

-   User Authentication and Authorization
-   Warehouse Management (physical storage locations)
-   Item Unit Management (measurement units for inventory)
-   Warehouse Inventory Tracking (items in warehouses)
-   Order Processing (e.g., stock out)
-   Integration with KiotViet (if applicable)

Key technologies used:

-   Python 3.11+
-   FastAPI
-   PostgreSQL (with SQLAlchemy ORM)
-   Redis (for caching and refresh tokens)
-   Pytest (for testing)
-   Docker (for containerization and deployment)

For detailed setup, testing, and API documentation, please refer to the `backend/README.md`.

### Frontend (`adminfront/`)

The admin frontend provides a user interface for managing the warehouse system. It is built with:

-   Next.js (React Framework)
-   TypeScript
-   Tailwind CSS (for styling)
-   Cypress (for end-to-end testing)
-   Jest (for unit/integration testing)

For detailed setup, development, and testing instructions, please refer to the `adminfront/README.md`.

## Getting Started

To get the full system running, you will typically need to:

1.  Set up and run the backend API.
2.  Set up and run the admin frontend application.

Please consult the respective `README.md` files in each sub-directory for specific instructions.

## Contribution

Details on how to contribute to this project can be found in the respective `README.md` files of the `backend` and `adminfront` directories.
