import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function loadEnvVarsFromDevVars(): Record<string, string> {
    const envVars: Record<string, string> = {};
    const devVarsPath = join(process.cwd(), '.dev.vars');
    try {
        const fileContent = readFileSync(devVarsPath, 'utf-8');
        fileContent.split('\n').forEach((line: string) => {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                const [key, value] = trimmedLine.split('=');
                if (key && value) {
                    envVars[key.trim()] = value.trim().replace(/^"|"$/g, '');
                }
            }
        });
    } catch (error) {
        console.warn("Warning: .dev.vars not found or could not be read. Relying on process.env.", error);
    }
    return envVars;
}
