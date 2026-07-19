import dotenv from 'dotenv';

dotenv.config();

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value && value.trim() !== '') {
    return value;
  }
  if (defaultValue != undefined) {
    return defaultValue;
  }
  throw new Error(`Environment variable ${key} is not defined and no default value was provided.`);
}

export const DEFAULT_URL = {
    BASE_URL: getEnv('BASE_URL', 'https://automationexercise.com'),
    API_URL: getEnv('API_URL', 'https://automationexercise.com/api'),
}

export const DEFAULT_ACCOUNT = {
    EMAIL: getEnv('EMAIL'),
    PASSWORD: getEnv('PASSWORD'),
}