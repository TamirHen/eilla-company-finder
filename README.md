# Company Finder Task- Tamir Hen

## Pre-requisites
- [docker](https://www.docker.com/)


## Getting started
- Clone the repo
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

