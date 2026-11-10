import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";

export async function GET() {
    await dbConnect();
    const session = await auth();

    if (!session || !session.user) {
        return Response.json(
            { success: false, message: "Not Authenticated" },
            { status: 401 }
        );
    }

    try {
        const userId = new mongoose.Types.ObjectId(session.user._id);

        const user = await UserModel.aggregate([
            { $match: { _id: userId } },
            // keep users who have no messages yet
            { $unwind: { path: '$messages', preserveNullAndEmptyArrays: true } },
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: '$messages' } } },
        ]);

        if (!user || user.length === 0) {
            return Response.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        const messages = (user[0].messages ?? []).filter(Boolean);

        return Response.json({ success: true, messages }, { status: 200 });
    } catch (error) {
        console.error("Error getting messages:", error);
        return Response.json(
            { success: false, message: "Cannot get messages for user" },
            { status: 500 }
        );
    }
}