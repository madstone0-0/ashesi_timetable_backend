import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as constants from "../constants";
import { logger } from "../logging";

let ssl = false;

let pool = new Pool({
    host: constants.PG_HOST,
    port: constants.PG_PORT,
    user: constants.PG_USER,
    password: constants.PG_PASS,
    database: constants.PG_DB,
    ssl: ssl,
});

logger.info(
    "Connecting to database with info:" +
        `\nHOST: ${constants.PG_HOST}` +
        `\nPORT: ${constants.PG_PORT}` +
        `\nUSER: ${constants.PG_USER}`,
);

const db = drizzle(pool, { logger: false });

export default db;
