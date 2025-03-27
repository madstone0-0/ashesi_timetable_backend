import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { PG_PORT, PG_USER, PG_PASS, PG_DB, PG_HOST } from "../constants";
import { logger } from "../logging";

let ssl = false;

let pool = new Pool({
    host: PG_HOST,
    port: PG_PORT,
    user: PG_USER,
    password: PG_PASS,
    database: PG_DB,
    ssl: ssl,
});

logger.info("Connecting to database with info:" + `\nHOST: ${PG_HOST}` + `\nPORT: ${PG_PORT}` + `\nUSER: ${PG_USER}`);

const db = drizzle(pool, { logger: false });

export default db;
