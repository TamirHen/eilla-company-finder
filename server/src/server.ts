import 'reflect-metadata'
import {useContainer as useOrmContainer} from 'typeorm'
import {useContainer as useRoutingControllerContainer} from "routing-controllers";
import {Container} from 'typeorm-typedi-extensions'
import dataSource from './data-source'
import express from "express"
import {useExpressServer} from "routing-controllers"
import cors from 'cors'

    ;
import path from 'path'

(async () => {

    try {
        // register typedi containers for dependency injection
        useOrmContainer(Container)
        useRoutingControllerContainer(Container)

        // initialize database connection
        await dataSource.initialize()
        console.log('[typeorm] Connected to database')

        const port: number = Number(process.env.SERVER_PORT)
        const app = express()
        app.use(cors())
        app.use(express.json());
        useExpressServer(app, {
            classTransformer: true,
            routePrefix: `/${process.env.SERVER_ROUTES_PREFIX}`,
            controllers: [path.join(__dirname + '/controllers/*.{ts,js}')],
        })
        app.listen(port)
        console.log(`[server]  Server is running at http://localhost:${port}`)
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
})()
