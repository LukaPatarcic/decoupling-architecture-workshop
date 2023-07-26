# FatCat Workshop Decoupling Architecture Workshop

## Prerequisites

* Node.js
* Docker

## Setup guide
Install moleculer-cli globally
```
npm i moleculer-cli -g
```
Create a new project (named fatcat-tasks)
```
moleculer init project fatcat-tasks
```
Open project folder
```
cd fatcat-tasks
```

# fatcat-tasks
This is a [Moleculer](https://moleculer.services/)-based microservices project. Generated with the [Moleculer CLI](https://moleculer.services/docs/0.14/moleculer-cli.html).

## Usage
Start the project with `npm run dev` command.
After starting, open the http://localhost:3000/ URL in your browser.
On the welcome page you can test the generated services via API Gateway and check the nodes & services.

In the terminal, try the following commands:
- `nodes` - List all connected nodes.
- `actions` - List all registered service actions.
- `call users.register --email example@gmail.com --password example` - Call the `users.register` action.


## Services
- **api**: API Gateway services
- **users**: API Users Service
- **tasks**: API Tasks Service

## Mixins
- **mongoose.mixin**: Database access mixin for services.


## Useful links

* Moleculer website: https://moleculer.services/
* Moleculer Documentation: https://moleculer.services/docs/0.14/

## NPM scripts

- `npm run dev`: Start development mode (load all services locally with hot-reload & REPL)
- `npm run start`: Start production mode (set `SERVICES` env variable to load certain services)
- `npm run cli`: Start a CLI and connect to production. Don't forget to set production namespace with `--ns` argument in script
- `npm run lint`: Run ESLint
- `npm run ci`: Run continuous test mode with watching
- `npm test`: Run tests & generate coverage report
- `npm run dc:up`: Start the stack with Docker Compose
- `npm run dc:down`: Stop the stack with Docker Compose
