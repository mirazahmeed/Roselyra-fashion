import { MongoClient, Db, Collection } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb+srv://roselyra-fashion:t0xgYa8kbUHJl4c3@cluster0.7cdmalj.mongodb.net/?appName=Cluster0";
const dbName = process.env.MONGODB_DB || "roselyra";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToMongoDB(): Promise<Db> {
	if (db) return db;

	client = new MongoClient(uri);
	await client.connect();
	db = client.db(dbName);
	console.log("Connected to MongoDB");

	return db;
}

export async function getDb(): Promise<Db> {
	if (!db) {
		return connectToMongoDB();
	}
	return db;
}

export async function closeMongoDB(): Promise<void> {
	if (client) {
		await client.close();
		client = null;
		db = null;
	}
}

export function getCollection<T extends Document>(name: string): Collection<T> {
	if (!db) throw new Error("Database not connected");
	return db.collection<T>(name);
}