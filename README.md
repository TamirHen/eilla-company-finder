# Company Finder Task- Tamir Hen

## Pre-requisites

- [docker](https://www.docker.com/)
- [docker compose](https://docs.docker.com/compose/install/)

## Getting started

Clone the repo
```shell
git clone https://github.com/TamirHen/eilla-company-finder.git
```

cd into repo folder
```shell
cd eilla-company-finder
```

Create .env file
```shell
cp .env.example .env
```

Create docker images
```shell
docker-compose build
```

Run the docker containers
```shell
docker-compose up -d
```

Run database migrations to create the tables
```shell
docker exec cf_server npm run migrate
```

Seed the database from the companies CSV file
```shell
docker exec cf_server npm run seed
```

## Frontend
The frontend is a React App written in TypeScript, and constructed using [Create React App](https://create-react-app.dev/).\
It defaults to run at http://localhost:3005 if nothing is changed in the `.env` file.

## Backend
The backend is an Express.js app written in TypeScript. It defaults to run at http://localhost:4005/api if nothing is changed in the `.env` file.\
It connects to a PostgreSQL database using [TypeORM](https://typeorm.io/).\
The backend follows the Repository design pattern and uses dependency injection to allow abstraction between its layers (Repository, Service, Controller).\
There's a Postman collection in the root of this repo `company_finder.postman_collection.json` which includes all the routes:

**vars are noted with {braces} 
### [GET] Get Similar Companies
```shell
http://localhost:{port}/api/company/similar/{companyId}?offset={offset}&limit={limit}
```

### [GET] Get Companies By Name
```shell
http://localhost:{port}/api/company?name={name|query}&caseSensitive={true|false}
```

### [GET] Get Company By ID
```shell
http://localhost:{port}/api/company/{companyId}
```

### [GET] Get Search Options
```shell
http://localhost:{port}/api/company/options
```

## Database
The database used in this project is PostgreSQL.\
The default connection configurations are as follows:
```
DB_USER=postgres
DB_PASSWORD=secret
DB_NAME=companiesfinder
DB_HOST=127.0.0.1
DB_HOST_PORT=5433
```
It contains 5 tables: \
`company`\
`keyword` \
`industry` \
`company_keywords_keyword` - many-to-many junction table \
`migrations` - managed by TypeORM 