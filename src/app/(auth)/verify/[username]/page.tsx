'use client'
import { VerifySchema } from '@/schemas/verifySchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { toast } from "@/components/ui/toast"
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/Apiresponse'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const VerifyAccount = () => {
    const router = useRouter()
    const params = useParams<{ username: string }>()

    type formValue = z.infer<typeof VerifySchema>
    const form = useForm<formValue>({
        resolver: zodResolver(VerifySchema),

    })
    const onSubmit = async (data: formValue) => {
        try {
            const response = await axios.post(`/api/verify-code`, {
                username: params.username,
                code: data.code
            })
            toast.add({
                title: "Sucess",
                description: response.data.message
            })
            router.replace('sign-in')
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            let errorMessage = axiosError.response?.data.message
            toast.add({
                title: 'Signup failed',
                description: errorMessage,
            })
        }
    }

    return (
        <div>
            <div>
                <div>
                    <h1>Verify Your Account</h1>
                    <p>Enter the verification code sent to your email</p>
                </div>
                <div>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <Controller
                                control={form.control}
                                name="code"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="content">Verification Code</FieldLabel>
                                        <Input
                                            {...field}
                                            id="code"
                                            placeholder="Code"
                                            aria-invalid={fieldState.invalid}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <Button type="submit">
                                Submit
                            </Button>
                        </FieldGroup>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default VerifyAccount
