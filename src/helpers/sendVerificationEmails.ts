import { resend } from "@/lib/resend";
import { VerificationEmail } from "../../email/VerificationEmail";
import { ApiResponse } from "@/types/Apiresponse";

export async function sendverificationEmail(
    email: string,
    username: string,
    verifyCode: string,
): Promise<ApiResponse> {
    try {
        // Bug Fix: Resend SDK returns { data, error } — it does NOT throw on failure.
        // We must destructure and check the error object explicitly.
        const { error } = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: email,
            subject: 'Mystery Verification Code',
            react: VerificationEmail({ username, otp: verifyCode }),
        });

        if (error) {
            console.error("Resend error:", error);
            return { success: false, message: error.message };
        }

        // Bug Fix: Was returning success: false even on success — now correctly returns true.
        return { success: true, message: 'Verification email sent successfully' };
    } catch (emailError) {
        console.error("Error sending verification email", emailError);
        return { success: false, message: 'Failed to send verification email' };
    }
}
