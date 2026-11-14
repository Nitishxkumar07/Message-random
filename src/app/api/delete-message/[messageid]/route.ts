import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ messageid: string }> }   // Promise in Next 15
) {
  const { messageid } = await params;                       // must be awaited

  const session = await auth();
  if (!session?.user?._id) {
    return Response.json({ success: false, message: "Not Authenticated" }, { status: 401 });
  }

  if (!mongoose.isValidObjectId(messageid) || !mongoose.isValidObjectId(session.user._id)) {
    return Response.json({ success: false, message: "Invalid id" }, { status: 400 });
  }

  try {
    await dbConnect();

    const result = await UserModel.updateOne(
      { _id: new mongoose.Types.ObjectId(session.user._id) },
      { $pull: { messages: { _id: new mongoose.Types.ObjectId(messageid) } } }
    );

    if (result.modifiedCount === 0) {
      return Response.json(
        { success: false, message: "Message not found or already deleted" },
        { status: 404 }
      );
    }
    return Response.json({ success: true, message: "Message deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting message:", error);
    return Response.json({ success: false, message: "Error deleting message" }, { status: 500 });
  }
}