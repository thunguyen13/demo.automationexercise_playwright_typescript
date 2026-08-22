import test from "@playwright/test";


export function step(this: any, stepName?: string) {
    // decorator function to wrap test steps with a descriptive name for better reporting and debugging
    return function decorator(this: any, target: Function, context: ClassMemberDecoratorContext) {
        // the replacement function that will be called instead of the original method
        return async function replacement(this: any, ...args: any[]) {
            const className = this.constructor.name;
            const methodName = String(context.name);
            const name = stepName ? formattedStepName(stepName, args) : `[${className}.${methodName}]`;
            // execute the original method within a test.step block to log it as a step in the test report
            return await test.step(name, async () => {
                console.log(`[${className}] Step: ${name}`);
                return await target.call(this, ...args);
            });
        };
    }
}

function formattedStepName(stepName: string, args: any[]): string {
    return stepName.replace(/\{(\d+)\}/g, (match, index) => {
        const argIndex = Number(index);
        const value = args[argIndex];
        if (value === undefined)
            return match;
        if (typeof value === "object" && value !== null)
            try {
                return JSON.stringify(value);
            } catch {
                return `[Object with circular reference at index ${argIndex}]`;
            }
        return String(value);
    });
}