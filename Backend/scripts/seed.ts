import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { User } from "../src/user/user.model";
import { Organizer } from "../src/organizer/organizer.model";
import { Category } from "../src/category/category.model";
import { Event } from "../src/event/event.schema";
import { BCRYPT_SALT_ROUNDS } from "../src/config/constants";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/event-booking";

const daysFromNow = (days: number): Date => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
};

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB...");

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Organizer.deleteMany({}),
            Category.deleteMany({}),
            Event.deleteMany({}),
        ]);
        console.log("Cleared existing data...");

        // Create Users
        const hashedPassword = await bcrypt.hash("password123", BCRYPT_SALT_ROUNDS);

        const users = await User.create([
            {
                name: "Admin User",
                email: "admin@example.com",
                password: hashedPassword,
                role: "admin",
            },
            {
                name: "Organizer One",
                email: "organizer1@example.com",
                password: hashedPassword,
                role: "organizer",
            },
            {
                name: "Organizer Two",
                email: "organizer2@example.com",
                password: hashedPassword,
                role: "organizer",
            },
            {
                name: "John Doe",
                email: "john@example.com",
                password: hashedPassword,
                role: "user",
            },
            {
                name: "Jane Smith",
                email: "jane@example.com",
                password: hashedPassword,
                role: "user",
            },
        ]);

        const organizerUser1 = users[1];
        const organizerUser2 = users[2];

        console.log("Users created...");

        // Create Organizers
        const organizers = await Organizer.create([
            {
                user: organizerUser1._id,
                organizationName: "Tech Events Inc.",
                description: "Leading organizer of tech conferences and workshops.",
                contactEmail: "contact@techevents.com",
                contactPhone: "+1234567890",
                address: {
                    country: "USA",
                    city: "San Francisco",
                    postalCode: "94105",
                    addressLine: "123 Tech Street",
                },
                status: "approved",
                totalEvents: 4,
            },
            {
                user: organizerUser2._id,
                organizationName: "Creative Arts Studio",
                description: "Promoting arts and culture through exhibitions and workshops.",
                contactEmail: "info@creativearts.com",
                contactPhone: "+0987654321",
                address: {
                    country: "UK",
                    city: "London",
                    postalCode: "SW1A 1AA",
                    addressLine: "456 Art Lane",
                },
                status: "approved",
                totalEvents: 4,
            },
        ]);

        console.log("Organizers created...");

        // Create Categories
        const categories = await Category.create([
            { name: "Technology", icon: "💻" },
            { name: "Music", icon: "🎵" },
            { name: "Arts", icon: "🎨" },
            { name: "Business", icon: "💼" },
        ]);

        console.log("Categories created...");

        // Create Events with dynamic dates relative to now
        const eventsData = [
            // Tech Events
            {
                organizer: organizers[0]._id,
                category: categories[0]._id,
                title: "Global Tech Summit",
                description: "Join industry leaders for the biggest tech conference of the year. Topics include AI, Blockchain, and Cloud Computing.",
                shortDescription: "The biggest tech conference of the year.",
                coverImage: "/event-placeholder.svg",
                venue: {
                    name: "Moscone Center",
                    address: "747 Howard St",
                    city: "San Francisco",
                    country: "USA",
                },
                eventDate: daysFromNow(15),
                eventTime: "09:00",
                ticketTypes: [
                    { name: "General Admission", price: 299, quantity: 500, soldCount: 0 },
                    { name: "VIP", price: 599, quantity: 100, soldCount: 0 },
                ],
                totalTickets: 600,
                availableTickets: 600,
                eventType: "hybrid",
                status: "approved",
                isFeatured: true,
                refundPolicy: "Full refund 30 days prior",
                termsAndConditions: "Standard terms apply",
            },
            {
                organizer: organizers[0]._id,
                category: categories[0]._id,
                title: "Web Dev Workshop",
                description: "Hands-on workshop for modern web development technologies including React, Node.js, and TypeScript.",
                shortDescription: "Learn modern web development.",
                coverImage: "/event-placeholder.svg",
                venue: {
                    name: "Tech Hub",
                    address: "123 Innovation Dr",
                    city: "San Jose",
                    country: "USA",
                },
                eventDate: daysFromNow(30),
                eventTime: "10:00",
                ticketTypes: [
                    { name: "Standard", price: 50, quantity: 50, soldCount: 0 },
                ],
                totalTickets: 50,
                availableTickets: 50,
                eventType: "offline",
                status: "approved",
                refundPolicy: "No refunds",
                termsAndConditions: "Bring your own laptop",
            },
            {
                organizer: organizers[0]._id,
                category: categories[3]._id,
                title: "Startup Pitch Night",
                description: "Watch promising startups pitch to investors. Networking opportunity afterwards.",
                shortDescription: "Networking and startup pitches.",
                coverImage: "/event-placeholder.svg",
                venue: {
                    name: "Innovation Lofts",
                    address: "500 Startup Way",
                    city: "San Francisco",
                    country: "USA",
                },
                eventDate: daysFromNow(45),
                eventTime: "18:00",
                ticketTypes: [
                    { name: "Entry", price: 0, quantity: 100, soldCount: 0 },
                ],
                totalTickets: 100,
                availableTickets: 100,
                eventType: "offline",
                status: "approved",
                refundPolicy: "N/A",
                termsAndConditions: "Registration required",
            },
            {
                organizer: organizers[0]._id,
                category: categories[0]._id,
                title: "AI & Future of Work",
                description: "Panel discussion on how AI is reshaping the workplace.",
                shortDescription: "AI impact on jobs.",
                coverImage: "/event-placeholder.svg",
                venue: { name: "Online", address: "Zoom", city: "Online", country: "Online" },
                eventDate: daysFromNow(60),
                eventTime: "14:00",
                ticketTypes: [
                    { name: "Webinar Access", price: 15, quantity: 1000, soldCount: 0 },
                ],
                totalTickets: 1000,
                availableTickets: 1000,
                eventType: "online",
                meetingLink: "https://zoom.us/j/123456789",
                status: "approved",
                isFeatured: true,
                refundPolicy: "No refunds",
                termsAndConditions: "Link sent 1 hour before",
            },
            // Art Events
            {
                organizer: organizers[1]._id,
                category: categories[2]._id,
                title: "Modern Art Exhibition",
                description: "Showcasing contemporary artists from around the globe.",
                shortDescription: "Contemporary art showcase.",
                coverImage: "/event-placeholder.svg",
                venue: {
                    name: "City Gallery",
                    address: "10 Art Pl",
                    city: "London",
                    country: "UK",
                },
                eventDate: daysFromNow(20),
                eventTime: "10:00",
                ticketTypes: [
                    { name: "Adult", price: 20, quantity: 200, soldCount: 0 },
                    { name: "Student", price: 10, quantity: 100, soldCount: 0 },
                ],
                totalTickets: 300,
                availableTickets: 300,
                eventType: "offline",
                status: "approved",
                isFeatured: true,
                refundPolicy: "No refunds",
                termsAndConditions: "No photography",
            },
            {
                organizer: organizers[1]._id,
                category: categories[1]._id,
                title: "Jazz in the Park",
                description: "An evening of smooth jazz under the stars.",
                shortDescription: "Outdoor jazz concert.",
                coverImage: "/event-placeholder.svg",
                venue: {
                    name: "Hyde Park",
                    address: "Hyde Park",
                    city: "London",
                    country: "UK",
                },
                eventDate: daysFromNow(10),
                eventTime: "19:00",
                ticketTypes: [
                    { name: "General Admission", price: 35, quantity: 500, soldCount: 0 },
                ],
                totalTickets: 500,
                availableTickets: 500,
                eventType: "offline",
                status: "approved",
                refundPolicy: "Rain or shine",
                termsAndConditions: "Bring your own blanket",
            },
            {
                organizer: organizers[1]._id,
                category: categories[2]._id,
                title: "Pottery Workshop",
                description: "Learn the basics of pottery and make your own mug.",
                shortDescription: "DIY Pottery class.",
                coverImage: "/event-placeholder.svg",
                venue: {
                    name: "Creative Studio",
                    address: "456 Art Lane",
                    city: "London",
                    country: "UK",
                },
                eventDate: daysFromNow(35),
                eventTime: "14:00",
                ticketTypes: [
                    { name: "Workshop Fee", price: 60, quantity: 15, soldCount: 0 },
                ],
                totalTickets: 15,
                availableTickets: 15,
                eventType: "offline",
                status: "approved",
                refundPolicy: "7 days notice",
                termsAndConditions: "Materials provided",
            },
            {
                organizer: organizers[1]._id,
                category: categories[2]._id,
                title: "Virtual Museum Tour",
                description: "Guided virtual tour of the world's most famous museums.",
                shortDescription: "Explore museums from home.",
                coverImage: "/event-placeholder.svg",
                venue: { name: "Online", address: "Web", city: "Online", country: "Online" },
                eventDate: daysFromNow(50),
                eventTime: "15:00",
                ticketTypes: [
                    { name: "Access Pass", price: 10, quantity: 1000, soldCount: 0 },
                ],
                totalTickets: 1000,
                availableTickets: 1000,
                eventType: "online",
                meetingLink: "https://museum-tour.com/join",
                status: "approved",
                refundPolicy: "No refunds",
                termsAndConditions: "High-speed internet required",
            },
        ];

        await Event.create(eventsData);
        console.log("Events created...");

        console.log("Database seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seed();
