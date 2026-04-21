import { connectToMongoDB, getDb } from "./src/lib/mongodb";
import { Product, Category, Collection as CollectionType, User } from "./src/types";
import fs from "fs";
import path from "path";

async function seed() {
	const db = await connectToMongoDB();

	const dataFile = path.join(process.cwd(), "data.json");
	const data = JSON.parse(fs.readFileSync(dataFile, "utf-8"));

	const products = db.collection<Product>("products");
	const categories = db.collection<Category>("categories");
	const collections = db.collection<CollectionType>("collections");
	const users = db.collection<User>("users");

	console.log("Seeding categories...");
	await categories.deleteMany({});
	await categories.insertMany(data.categories || []);

	console.log("Seeding collections...");
	await collections.deleteMany({});
	await collections.insertMany(data.collections || []);

	console.log("Seeding products...");
	await products.deleteMany({});
	await products.insertMany(data.products || []);

	console.log("Seeding users...");
	await users.deleteMany({});
	const adminUser: User = {
		id: "user_001",
		email: "admin@roselyra.com",
		name: "Admin User",
		role: "ADMIN",
		avatar: null,
		password: "$2a$10$kp.X.P0PsO7pLT5LZzV0V.5rO/rWq3UqXGfKNMiFYiKM7P5xYxYx",
		emailVerified: true,
		createdAt: new Date("2025-01-01"),
	};
	await users.insertOne(adminUser);

	console.log("Seeding complete!");
	process.exit(0);
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});