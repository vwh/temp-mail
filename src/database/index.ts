import { DatabaseService } from "./service";

export function createDatabaseService(db: D1Database) {
	return new DatabaseService(db);
}

export * from "./d1";
export * from "./r2";
export * from "./service";
