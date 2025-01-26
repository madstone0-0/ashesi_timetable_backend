# Study Spot Finder Backend

[![Node.js CI](https://img.shields.io/badge/Node.js-v20.0.0+-green?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16+-blue?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docs.docker.com/compose/)

Backend server for the Study Spot Finder project, providing RESTful APIs for managing study locations, user interactions, and real-time data. Built with Node.js, Express, and PostgreSQL.

## Features
- Dockerized development environment
- PostgreSQL database integration
- Automated database migrations
- Environment-based configuration
- Hot-reload development setup

## Prerequisites
- Docker (optional) _or_
- Node.js v20.0.0+
- PostgreSQL v16+

## Getting Started

### **Docker Setup**
1. Clone the repository
2. Start services with auto-build:

```bash
   docker-compose up --build
```
This will start:
- Node.js server on port 3000
- PostgreSQL database on port 5432

### Node.js 

To run the server locally:

#### Prerequisites
- Node.js v20.0.0+
- npm v10.0.0+ (pnpm recommended)
- PostgreSQL v16+

1. Install dependencies:

```bash
   pnpm install
```

2. Setup Database
- Start PostgreSQL server
- Execute SQL scripts from `src/db/migrations`

3. Create `.env` file

```bash
PG_USER="USER"
PG_HOST="HOST"
PG_PASS="PASS"
PG_DB="public"
PG_PORT="5432"
PG_LOCAL_PORT="5433"
```

4. Start Server

```bash
pnpm dev
```
