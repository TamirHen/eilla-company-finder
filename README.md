# Company Finder Task- Tamir Hen

## Pre-requisites

- [docker](https://www.docker.com/)


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

**The program is now running on localhost:3005 and localhost:4005 for the frontend and backend respectively (or any other ports if changed in the .env file)**

## Test API directly
There's a Postman collection in the root of this repo with all the available routes already set up.

## Routes

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