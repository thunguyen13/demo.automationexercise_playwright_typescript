import { getEnv } from "./env.config";

export const DEFAULT_ACCOUNT = {
    EMAIL: getEnv('EMAIL'),
    PASSWORD: getEnv('PASSWORD'),
}