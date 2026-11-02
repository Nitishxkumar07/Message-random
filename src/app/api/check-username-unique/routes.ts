import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { UsernameValidation } from "@/schemas/signUpSchema";
import { success, z } from 'zod';

const UsernameQuerySchema = z.object({
    username: UsernameValidation
})

export async function GET(request: Request) {

    // if (request.method !== 'GET') {
    //     return Response.json({
    //         success: false,
    //         message: "Method is not allowed"
    //     }, { status: 405 })
    // }

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
                message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : "invalid Query Parameter"
            })
        }
        const { username } = result.data

        const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true })

        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                message: "username is already taken"
            }, { status: 400 })
        }
        return Response.json({
            success: true,
            message: "username is available"
        }, { status: 400 })

    } catch (error) {
        console.log("Error checking Username ", error)
        return Response.json(
            {
                success: false,
                message: "Error Checking username"
            },
            {
                status: 500
            }
        )
    }
}

