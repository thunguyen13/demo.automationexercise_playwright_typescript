import path from "path";
import fs from "fs";
import { parse } from "csv-parse/sync";

const ROOT_FOLDER = process.cwd();
const DATA_FOLDER = path.join(ROOT_FOLDER, 'src', 'data');

/**
 * Get data from a JSON file and parse it into an array of objects of type T.
 * @param filePath - path to the file from the data folder, e.g. "api/registerUserAccount.json"
 * @returns json data
 */
export function getDataFromJsonFile<T>(filePath: string): T {
    const fullPath = path.join(DATA_FOLDER, filePath);
    try {
        return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    } catch (error) {
        console.error(`Error reading or parsing file at ${fullPath}:`, error);
        throw error;
    }
}

/**
 * Get data from a CSV file and parse it into an array of objects. Each object represents a row in the CSV file, with keys corresponding to the column headers.
 * @param filePath - path to the file from the data folder, e.g. "api/registerUserAccount.csv"
 * @returns an array of objects
 */
export function getDataFromCsvFile(filePath: string) {
    const fullPath = path.join(DATA_FOLDER, filePath);
    try {
        let records: object[] = [];
        const fileContent = fs.readFileSync(fullPath, 'utf-8');
        records = parse(fileContent, {
            columns: true,
            trim: true,
            skip_empty_lines: true,
        });
        return records;
    } catch (error) {
        console.error(`Error reading or parsing file at ${fullPath}:`, error);
        throw error;
    }
}