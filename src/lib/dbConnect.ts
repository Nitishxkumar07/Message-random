import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number,
}

const connection: ConnectionObject = {}

export async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("already connected");
        return
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Message', {})

        connection.isConnected = db.connections[0].readyState
        console.log("Db connected sucessfully")
    } catch (error) {
        console.log("database connection failed", error);
        process.exit(1)
    }
}
