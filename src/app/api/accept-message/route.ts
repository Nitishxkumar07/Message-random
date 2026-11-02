import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
    await dbConnect();

    const session = await auth();

    if (!session || !session.user) {
        return Response.json(
            { success: false, message: "Not Authenticated" },
            { status: 401 }
        );
    }

    const userId = session.user._id;
    const { acceptMessages } = await request.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessages: acceptMessages },
            { new: true }
        );

        if (!updatedUser) {
            return Response.json(
                { success: false, message: "User not updated" },
                { status: 404 }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Message acceptance status updated successfully",
                updatedUser,
            },
            { status: 200 }
        );
    } catch (error) {
        return Response.json(
            { success: false, message: "Failed to update user status to accept messages" },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    await dbConnect();

    const session = await auth();

    if (!session || !session.user) {
        return Response.json(
            { success: false, message: "Not Authenticated" },
            { status: 401 }
        );
    }

    try {
        const foundUser = await UserModel.findById(session.user._id);

        if (!foundUser) {
            return Response.json(
                { success: false, message: "Failed to find user" },
                { status: 404 }
            );
        }

        return Response.json(
            { success: true, isAcceptingMessages: foundUser.isAcceptingMessages },
            { status: 200 }
        );
    } catch (error) {
        return Response.json(
            { success: false, message: "Error getting message status" },
            { status: 500 }
        );
    }
}