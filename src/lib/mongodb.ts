import { MongoClient, Db, Collection } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb+srv://roselyra-fashion:t0xgYa8kbUHJl4c3@cluster0.7cdmalj.mongodb.net/?appName=Cluster0";
const dbName = process.env.MONGODB_DB || "roselyra";

// Cache the MongoDB client on the global object to survive Next.js HMR in dev
const globalForMongo = globalThis as unknown as {
	_mongoClient: MongoClient | undefined;
	_mongoDb: Db | undefined;
	_mongoConnecting: Promise<Db> | undefined;
};

export async function connectToMongoDB(): Promise<Db> {
	// Return cached connection
	if (globalForMongo._mongoDb) return globalForMongo._mongoDb;

	// If a connection is already in progress, await it (prevents parallel connections)
	if (globalForMongo._mongoConnecting) return globalForMongo._mongoConnecting;

	globalForMongo._mongoConnecting = (async () => {
		const client = new MongoClient(uri, {
			// Pool connections for better throughput
			maxPoolSize: 10,
			minPoolSize: 2,
			// Reduce initial connection timeout
			connectTimeoutMS: 10000,
			serverSelectionTimeoutMS: 10000,
		});
		await client.connect();
		const db = client.db(dbName);
		globalForMongo._mongoClient = client;
		globalForMongo._mongoDb = db;
		console.log("Connected to MongoDB");
		return db;
	})();

	return globalForMongo._mongoConnecting;
}

export async function getDb(): Promise<Db> {
	if (globalForMongo._mongoDb) return globalForMongo._mongoDb;
	return connectToMongoDB();
}

export async function closeMongoDB(): Promise<void> {
	if (globalForMongo._mongoClient) {
		await globalForMongo._mongoClient.close();
		globalForMongo._mongoClient = undefined;
		globalForMongo._mongoDb = undefined;
		globalForMongo._mongoConnecting = undefined;
	}
}

export function getCollection<T extends Document>(name: string): Collection<T> {
	if (!globalForMongo._mongoDb) throw new Error("Database not connected");
	return globalForMongo._mongoDb.collection<T>(name);
}