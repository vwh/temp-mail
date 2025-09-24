import { DatabaseService } from "./service";

export function createDatabaseService(db: D1Database) {
	return new DatabaseService(db);
}

export * from "./service";
export * from "./d1";
export * from "./r2";
export * from "./kv";
