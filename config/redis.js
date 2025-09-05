import { createClient } from "redis";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";


dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// try project root .env first, then a relative fallback
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
if (!process.env.REDIS_HOST) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}
const {
    REDIS_HOST,REDIS_PORT,REDIS_USERNAME,REDIS_PASSWORD
} = process.env;

if(!REDIS_HOST || !REDIS_PORT){
    console.warn('REDIS_HOST or REDIS_PORT not set. Redis client may fail to connect.');
}

console.log(process.env.REDIS_PORT);
const client = createClient({
  username: REDIS_USERNAME || undefined,
  password: REDIS_PASSWORD || undefined,
  socket: {
    host: REDIS_HOST || 'localhost',
    port: REDIS_PORT ? Number(REDIS_PORT) : 11706
  }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

export default client;




