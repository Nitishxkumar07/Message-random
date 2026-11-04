import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";

export async function POST(request: Request) {
    await dbConnect()

    const { username, content } = await request.json()
    try {
        const user = await UserModel.findOne({ username })
        if (!user) {
            return Response.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }
        if (!user.isAcceptingMessages) {
            return Response.json(
                { success: false, message: "User is not accepting messages" },
                { status: 403 }
            );
        }
        const newMessage = { content, createdAt: new Date() }
        user.messages.push(newMessage as Message)

        // Bug Fix 1: `user.save()` was missing — message was never persisted to DB
        await user.save()

        // Bug Fix 2: success response had status: 403 — now correctly 200
        return Response.json(
            { success: true, message: "Message sent successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error sending message:", error)
        return Response.json(
            { success: false, message: "Some problem sending message" },
            { status: 500 }
        );
    }
}
