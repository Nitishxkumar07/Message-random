'use client'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useDebounceCallback } from 'usehooks-ts'
import { toast } from "@/components/ui/toast"
import { useRouter } from 'next/navigation';
import { signUpSchema } from '@/schemas/signUpSchema';
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/Apiresponse';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const page = () => {
    const [username, setUsername] = useState('')
    const [usernameMessage, setUsernameMessage] = useState('')
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const debouced = useDebounceCallback(setUsername, 300)
    const router = useRouter();
    type formValue = z.infer<typeof signUpSchema>

    const form = useForm<formValue>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: "",
            email: '',
            password: '',
        }
    })


    useEffect(() => {
        const checkUsernameUnique = async () => {
            if (username) {
                setIsCheckingUsername(true)
                setUsernameMessage('')
                try {
                    const response = await axios.get(`/api/check-username-unique?username=${username}`)
                    setUsernameMessage(response.data.message)
                } catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>;
                    setUsernameMessage(axiosError.response?.data.message ?? "Error checking username")
                } finally {
                    setIsCheckingUsername(false)
                }
            }
        }
        checkUsernameUnique()
    }, [username])


    const onSubmit = async (data: formValue) => {
        setIsSubmitting(true)
        try {
            const response = await axios.post<ApiResponse>('/api/signUp', data)
            toast.add({
                title: "Sucess",
                description: response.data.message
            })
            router.replace(`/verify/${data.username}`)
            // setIsSubmitting(false)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            let errorMessage = axiosError.response?.data.message
            toast.add({
                title: 'Signup failed',
                description: errorMessage,
            })
            setIsSubmitting(false)
        }
    }


    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Message anyone SignUp</h1>
                    <p className="mt-3 text-sm text-slate-500">Create account to the message anyone</p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FieldGroup className="space-y-2">
                            <Controller
                                name="username"
                                control={form.control}

                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                                        <FieldLabel htmlFor="username" className="text-sm font-medium text-slate-700">Username</FieldLabel>
                                        <Input
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e)
                                                debouced(e.target.value)
                                            }}
                                            id='username'
                                            placeholder="Enter your username"
                                            aria-invalid={fieldState.invalid}
                                            className="h-11 rounded-xl border-slate-200 bg-slate-50/50 px-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus-visible:border-slate-900 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-slate-900/10 aria-invalid:border-red-400 aria-invalid:ring-red-100"
                                        />
                                        {isCheckingUsername && <Loader2 className='animate-spin h-4 w-4 text-slate-400' />}
                                        <p className="text-xs text-slate-500">{usernameMessage}</p>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs text-red-500" />}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                        <FieldGroup className="space-y-2">
                            <Controller
                                name="email"
                                control={form.control}
                                //@ts-ignore
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                                        <FieldLabel htmlFor="email" className="text-sm font-medium text-slate-700">Email</FieldLabel>
                                        <Input
                                            {...field}
                                            placeholder="Enter your email"
                                            id='email'
                                            aria-invalid={fieldState.invalid}
                                            className="h-11 rounded-xl border-slate-200 bg-slate-50/50 px-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus-visible:border-slate-900 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-slate-900/10 aria-invalid:border-red-400 aria-invalid:ring-red-100"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs text-red-500" />}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                        <FieldGroup className="space-y-2">
                            <Controller
                                name="password"
                                control={form.control}
                                //@ts-ignore
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                                        <FieldLabel htmlFor="password" className="text-sm font-medium text-slate-700">Password</FieldLabel>
                                        <Input
                                            {...field}
                                            type='password'
                                            placeholder="Enter your password"
                                            id='password'
                                            aria-invalid={fieldState.invalid}
                                            className="h-11 rounded-xl border-slate-200 bg-slate-50/50 px-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus-visible:border-slate-900 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-slate-900/10 aria-invalid:border-red-400 aria-invalid:ring-red-100"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs text-red-500" />}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                        <Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-xl bg-slate-900 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                            {
                                isSubmitting ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />Please wait
                                    </>
                                ) : ('Signup')
                            }
                        </Button>
                    </form>
                    <div className="mt-6 border-t border-slate-100 pt-6 text-center">
                        <p className="text-sm text-slate-500">Already a member?{' '}
                            <Link href={'/sign-in'} className="font-medium text-slate-900 underline-offset-4 transition hover:underline">Signin</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page