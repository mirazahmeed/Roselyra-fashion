import { products, categories, collections, productImages } from "./src/lib/db";
import fs from "fs";
import path from "path";

const users = [
	{
		id: "user_001",
		email: "admin@roselyra.com",
		name: "Admin User",
		role: "ADMIN",
		avatar: null,
		password: "$2a$10$kp.X.P0PsO7pLT5LZzV0V.5rO/rWq3UqXGfKNMiFYiKM7P5xYxYx",
		createdAt: new Date("2025-01-01"),
	},
];

const data = {
	products,
	categories,
	collections,
	users,
	orders: [],
	media: [],
	seoData: {},
	productImages,
	homeConfig: {
		hero: {
			row1: {
				title: "Ethereal Elegance",
				subtitle: "Discover our new Spring/Summer collection",
				links: [{ label: "Shop Now", url: "/shop" }],
				images: [
					"/uploads/1772219774543-991945229-calvin-visuals--yPg8cusGD8-unsplash.jpg",
					"/uploads/1772219381398-768091209-hero_img.jpg",
				],
			},
			row2: {
				images: [
					"/uploads/1772219886792-754625846-calvin-visuals--yPg8cusGD8-unsplash.jpg",
				],
			},
		},
	},
};

fs.writeFileSync(
	path.join(process.cwd(), "data.json"),
	JSON.stringify(data, null, 2),
);
console.log("Seed data extracted to data.json");
