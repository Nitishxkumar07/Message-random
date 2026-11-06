import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";

export async function DELETE(request: Request, { params }: { params: { messageid: string } }) {
    const messageId = params.messageid
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
        const updatedResult = await UserModel.updateOne(
            { _id: userId._id },
            { $pull: { messages: { _id: messageId } } }
        )
        if (updatedResult.modifiedCount == 0) {
            return Response.json(
                { success: false, message: "Message Not found or already deleted" },
                { status: 404 }
            );
        }
        return Response.json(
            { success: true, message: "Message deleted sucessfully" },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error getting messages:", error)
        return Response.json(
            { success: false, message: "Error deleting message" },
            { status: 500 }
        );
    }
}
