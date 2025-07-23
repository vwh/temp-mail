import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnvVarsFromDevVars } from './env';

export interface CloudflareApiResponse<T> {
    result: T;
    success: boolean;
    errors: any[];
    messages: any[];
}

export interface WorkerScript {
    id: string;
}

export interface D1Database {
    uuid: string;
    name: string;
    created_at: string;
}

export interface KVNamespace {
    id: string;
    title: string;
}

export interface Zone {
    id: string;
    name: string;
    status: string;
}

export interface EmailRoutingRule {
    id: string;
    name: string;
    enabled: boolean;
}

export async function getCloudflareApiData<T>(path: string, useAccountPath: boolean = true): Promise<CloudflareApiResponse<T>> {
    const devVars = loadEnvVarsFromDevVars();
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || devVars.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN || devVars.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
        console.error("Error: CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN must be set in environment variables or .dev.vars.");
        process.exit(1);
    }

    const baseUrl = useAccountPath ? `https://api.cloudflare.com/client/v4/accounts/${accountId}` : `https://api.cloudflare.com/client/v4`;
    const url = `${baseUrl}${path}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Cloudflare API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        return await response.json() as CloudflareApiResponse<T>;
    } catch (error) {
        console.error(`Failed to fetch from Cloudflare API for path ${path}:`, error);
        throw error;
    }
}
