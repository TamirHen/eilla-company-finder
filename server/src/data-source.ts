import {DataSource} from "typeorm";
import path from "path";
import {SnakeNamingStrategy} from "typeorm-naming-strategies";

const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: process.env.NODE_ENV !== 'production',
    entities: [path.join(__dirname + '/models/*.{js,ts}')],
    // migrations:[path.join(__dirname + '/migrations/*.{js,ts}')],
    namingStrategy: new SnakeNamingStrategy()
})

export default dataSource
