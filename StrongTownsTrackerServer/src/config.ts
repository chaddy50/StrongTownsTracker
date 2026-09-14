import { config as loadDotenv } from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export interface Config {
  port: number;
  databaseUrl: string;
  legistarClient: string;
}

function readRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parsePort(rawPort: string): number {
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid PORT value: ${rawPort}`);
  }
  return port;
}

export function loadConfig(): Config {
  const packageDir = path.dirname(fileURLToPath(import.meta.url));
  loadDotenv({ path: path.resolve(packageDir, '../../.env') });

  return {
    port: parsePort(readRequiredEnvVar('PORT')),
    databaseUrl: readRequiredEnvVar('DATABASE_URL'),
    legistarClient: readRequiredEnvVar('LEGISTAR_CLIENT'),
  };
}
