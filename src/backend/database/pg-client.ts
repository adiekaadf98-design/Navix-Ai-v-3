import { Pool } from 'pg';
import { logger } from '../utils/logger';

// Default mock pool if credentials not provided, allowing fallback for preview
export class PostgresClient {
  private pool: Pool | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    if (process.env.DATABASE_URL) {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Typical for managed DBs
      });
      
      this.pool.on('error', (err) => {
        logger.error('Unexpected error on idle PostgreSQL client', err);
        this.isConnected = false;
      });

      this.pool.connect()
        .then(() => {
           this.isConnected = true;
           logger.info('Connected to PostgreSQL (Data Layer)');
        })
        .catch(err => {
           logger.error('PostgreSQL Connection Error:', err);
        });
    } else {
      logger.warn('DATABASE_URL not set. PostgreSQL is unavailable; database operations will fail closed.');
    }
  }

  async query(text: string, params?: any[]) {
    if (this.pool && this.isConnected) {
      const start = Date.now();
      try {
        const res = await this.pool.query(text, params);
        const duration = Date.now() - start;
        logger.debug(`Executed query`, { text, duration, rows: res.rowCount });
        return res.rows;
      } catch (err) {
        logger.error('Database query failed', { text, error: err });
        throw err;
      }
    } else {
      throw new Error('PostgreSQL is not configured or not connected. Set DATABASE_URL before using persistent database features.');
    }
  }
}

export const pgClient = new PostgresClient();
