import {z} from "zod";

export const VerifySchema = z.object({
    code: z.string().length(6, "vefification code myst be 6 digit")
})


