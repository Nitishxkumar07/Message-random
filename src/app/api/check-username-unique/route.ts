import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { UsernameValidation } from "@/schemas/signUpSchema";
import { z } from 'zod';
// Bug Fix: Removed invalid `import { success }` from zod — it doesn't exist

const UsernameQuerySchema = z.object({
    username: UsernameValidation
})

export async function GET(request: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(request.url)
        const queryParam = {
            username: searchParams.get('username')
        }
        const result = UsernameQuerySchema.safeParse(queryParam)
        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : "Invalid query parameter"
            }, { status: 400 })
        }
        const { username } = result.data

        const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true })

        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                message: "Username is already taken"
            }, { status: 400 })
        }

        // Bug Fix: Was returning status: 400 on success — now correctly returns 200
        return Response.json({
            success: true,
            message: "Username is available"
        }, { status: 200 })

    } catch (error) {
        console.error("Error checking username:", error)
        return Response.json(
            {
                success: false,
                message: "Error checking username"
            },
            { status: 500 }
        )
    }
}
