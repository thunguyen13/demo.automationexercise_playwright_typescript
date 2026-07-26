
/**
 * To get the current date and time in the format "dd-mm-yyyy_HH-MM-SS" for the Vietnam timezone (Asia/Ho_Chi_Minh)
 * @returns a string representing the current date and time in the format "dd-mm-yyyy_HH-MM-SS" for the Vietnam timezone (Asia/Ho_Chi_Minh)
 */
export function getVietnameseTimestamp(): string {
    const formatter = new Intl.DateTimeFormat('fr-FR', { //fr-FR: dd/mm/yyyy HH:mm:ss
        timeZone: 'Asia/Ho_Chi_Minh',
        year: "numeric",
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
    const timestamp = formatter.format(new Date()).replace(" ","_").replace(/:/g, "-").replace(/\//g, "-");
    return timestamp;
}

/**
 * To clean an object of undefined values by filtering out the entries with undefined values and returning a new object with only the defined values
 * @param obj object to be cleaned of undefined values
 * @returns object with undefined values removed
 */
export function cleanUndefinedValues(obj: Record<any, any>) {
    const entries = Object.entries(obj);
    const filteredEntries = entries.filter(([_, v]) => v !== undefined);
    return Object.fromEntries(filteredEntries);
}

/**
 * To retrieve a value from an object based on a specified path, e.g. "user.address[0]["street"]
 * @param obj object containing the value to be retrieved
 * @param path string representing the path to the desired value, using dot notation for nested properties and square brackets for array indices (e.g., "user.address[0].street")
 * @returns value at the specified path in the object, or undefined if the path does not exist
 */
export function getValueFieldByPath(obj: Record<string, any>, path: string) {
    const cleanPath = path.replace(/\[(.*?)\]/g, '.$1').replace(/^\./, '').replace(/["']/g, '');
    const keys = cleanPath.split('.');
    const value = keys.reduce((acc: any, key: string) => acc?.[key], obj as any);
    return value;
}

/**
 * To identify and retrieve duplicate objects from an array based on a specified key.
 * @param array An array of objects to be checked for duplicates based on a specified key
 * @param key The key in the objects to be used for checking duplicates. The function will identify objects that have the same value for this key as duplicates.
 * @returns An array of objects that are duplicates based on the specified key
 */
export function getDuplicateByKey<T>(array: T[], key: keyof T): T[] {
    const seen = new Set();
    const duplicates: T[] = [];
    for (const item of array) {
        const value = item[key];
        if (seen.has(value))
            duplicates.push(item);
        else 
            seen.add(value);
    }
    return duplicates;
}

/**
 * Generates a unique string representation of a random number within a specified range, with an optional timestamp prefix for added uniqueness.
 * @param min minimum value for the random number generation (inclusive)
 * @param max maximum value for the random number generation (inclusive)
 * @param useTimestamp boolean flag to include the current timestamp in the generated string (optional, default is false). If set to true, the current timestamp in base36 format will be prefixed to the generated random number string, providing an additional layer of uniqueness.
 * @returns string representation of the generated random number
 */
export function generateUniqueNumberString(min: number, max: number, useTimestamp?: boolean): string {
    const timestampBase36 = useTimestamp ? Date.now().toString(36) : '';
    if (min > max) {
        throw new Error("Minimum value cannot be greater than maximum value.");
    }
    const randomInt = Math.floor(Math.random() * (max - min + 1)) + min;
    const randomStringNumber = `${timestampBase36}${randomInt}`;
    return randomStringNumber;
}

