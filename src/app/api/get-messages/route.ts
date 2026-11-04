import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";

export async function GET(request: Request) {
    await dbConnect();
    const session = await auth();

    if (!session || !session.user) {
        return Response.json(
            { success: false, message: "Not Authenticated" },
            { status: 401 }
        );
    }

    const userId = new mongoose.Types.ObjectId(session.user._id);

    try {
        // Bug Fix 1: Added `await` — aggregate() returns a Promise, was being treated as value
        // Bug Fix 2: `$match: { id: userId }` → `$match: { _id: userId }` (MongoDB uses _id)
        // Bug Fix 3: `$unwind: 'messages'` → `$unwind: '$messages'` ($ prefix required for field refs)
        const user = await UserModel.aggregate([
            { $match: { _id: userId } },
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: '$messages' } } }
        ])

        if (!user || user.length === 0) {
            return Response.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return Response.json(
            { success: true, messages: user[0].messages },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error getting messages:", error)
        return Response.json(
            { success: false, message: "Cannot get messages for user" },
            { status: 500 }
        );
    }
}
