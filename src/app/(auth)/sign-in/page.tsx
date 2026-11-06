'use client'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Loader2 } from 'lucide-react'

import { toast } from '@/components/ui/toast'
import { signInSchema } from '@/schemas/signInSchema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'

type FormValue = z.infer<typeof signInSchema>

const labelClass = 'text-sm font-medium text-slate-700'

const inputClass =
    'h-11 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 shadow-none ' +
    'placeholder:text-slate-400 transition-colors ' +
    'focus-visible:border-slate-900 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-slate-900/5 ' +
    'aria-invalid:border-red-400 aria-invalid:ring-4 aria-invalid:ring-red-500/10'

const errorClass = 'text-xs font-medium text-red-500'

const Page = () => {
    const router = useRouter()

    const form = useForm<FormValue>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: '',
            password: '',
        },
    })

    const onSubmit = async (data: FormValue) => {
        const result = await signIn('credentials', {
            redirect: false,
            identifier: data.identifier,
            password: data.password,
        })

        if (result?.error) {
            toast.add({
                title: 'Login failed',
                description: 'Incorrect username or password',
            })
            return
        }

        if (result?.ok) {
            router.replace('/dashboard')
        }
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
            {/* soft background glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-slate-200 via-slate-100 to-transparent blur-3xl"
            />

            <div className="relative w-full max-w-[26rem]">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                        Message anyone SignIn
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">Sign in to message anyone</p>
                </header>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(15_23_42/0.06)] sm:p-8">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
                        <FieldGroup className="space-y-5">
                            <Controller
                                name="identifier"
                                control={form.control}
                                //@ts-ignore
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="space-y-2">
                                        <FieldLabel htmlFor="identifier" className={labelClass}>
                                            Email/Username
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="identifier"
                                            autoComplete="username"
                                            placeholder="Enter your email"
                                            aria-invalid={fieldState.invalid}
                                            className={inputClass}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} className={errorClass} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="password"
                                control={form.control}
                                //@ts-ignore
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="space-y-2">
                                        <FieldLabel htmlFor="password" className={labelClass}>
                                            Password
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="password"
                                            type="password"
                                            autoComplete="current-password"
                                            placeholder="Enter your password"
                                            aria-invalid={fieldState.invalid}
                                            className={inputClass}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} className={errorClass} />
                                        )}
                                    </Field>
                                )}
                            />
                        </FieldGroup>

                        <Button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                            className="h-11 w-full rounded-xl bg-slate-900 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {form.formState.isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </Button>
                    </form>

                    <p className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
                        To Create Account{' '}
                        <Link
                            href="/sign-up"
                            className="font-medium text-slate-900 underline-offset-4 hover:underline"
                        >
                            Signup
                        </Link>
                    </p>
                </section>
            </div>
        </main>
    )
}

export default Page