import {
    getCloudflareApiData,
    WorkerScript,
    D1Database,
    KVNamespace,
    Zone,
    EmailRoutingRule,
} from './api';

export async function report() {
    console.log("Fetching Cloudflare resource information...");

    let zones: Zone[] = [];

    // --- Domains (Zones) ---
    try {
        const zonesData = await getCloudflareApiData<Zone[]>('/zones', false); // Pass false for useAccountPath
        if (zonesData.success) {
            console.log("\n--- Cloudflare Domains (Zones) ---");
            if (zonesData.result.length === 0) {
                console.log("No domains found in this account.");
            } else {
                zones = zonesData.result;
                zones.forEach((zone: Zone) => {
                    console.log(`  - Name: ${zone.name}, ID: ${zone.id}, Status: ${zone.status}`);
                });
            }
        }
    } catch (error) {
        console.error("Could not fetch domain (zone) information.");
    }

    // --- Email Routing Status per Domain ---
    if (zones.length > 0) {
        console.log("\n--- Email Routing Status per Domain ---");
        for (const zone of zones) {
            try {
                const emailRoutingRulesData = await getCloudflareApiData<EmailRoutingRule[]>(`/zones/${zone.id}/email/routing/rules`, false); // Zone-specific API, so useAccountPath is false
                if (emailRoutingRulesData.success) {
                    console.log(`  Domain: ${zone.name}`);
                    if (emailRoutingRulesData.result.length === 0) {
                        console.log(`    No email routing rules found.`);
                    } else {
                        emailRoutingRulesData.result.forEach((rule: EmailRoutingRule) => {
                            console.log(`    - Rule: ${rule.name} (ID: ${rule.id}, Enabled: ${rule.enabled})`);
                        });
                    }
                }
            } catch (error) {
                console.error(`  Could not fetch email routing rules for ${zone.name}. Ensure your API token has 'Zone:Email:Read' permissions.`);
            }
        }
    }

    // --- Workers ---
    try {
        const workersData = await getCloudflareApiData<WorkerScript[]>('/workers/scripts');
        if (workersData.success) {
            console.log("\n--- Cloudflare Workers ---");
            console.log(`Number of Workers deployed: ${workersData.result.length}`);
            workersData.result.forEach((worker: WorkerScript) => {
                console.log(`  - Name: ${worker.id}`);
            });
        }
    } catch (error) {
        console.error("Could not fetch Workers information.");
    }

    // --- D1 Databases ---
    try {
        const d1Data = await getCloudflareApiData<D1Database[]>('/d1/database');
        if (d1Data.success) {
            console.log("\n--- Cloudflare D1 Databases ---");
            if (d1Data.result.length === 0) {
                console.log("No D1 databases found.");
            } else {
                d1Data.result.forEach((db: D1Database) => {
                    console.log(`  - Name: ${db.name}, ID: ${db.uuid}, Created: ${db.created_at}`);
                });
            }
        }
    } catch (error) {
        console.error("Could not fetch D1 database information.");
    }

    // --- KV Namespaces ---
    try {
        const kvData = await getCloudflareApiData<KVNamespace[]>('/storage/kv/namespaces');
        if (kvData.success) {
            console.log("\n--- Cloudflare KV Namespaces ---");
            if (kvData.result.length === 0) {
                console.log("No KV namespaces found.");
            }
            else {
                kvData.result.forEach((ns: KVNamespace) => {
                    console.log(`  - Title: ${ns.title}, ID: ${ns.id}`);
                });
            }
        }
    } catch (error) {
        console.error("Could not fetch KV namespace information.");
    }
}
