'use client'
import { useRef, useState } from 'react'
import * as z from 'zod'
import Link from 'next/link'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { Loader2, Send, Sparkles, Square, ShieldCheck } from 'lucide-react'
import { messageSchema } from '@/schemas/messageSchema'
import { ApiResponse } from '@/types/Apiresponse'
import { toast } from '@/components/ui/toast'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'

type FormValue = z.infer<typeof messageSchema>

const INITIAL_SUGGESTIONS = [
  "What's a hobby you've recently started?",
  'If you could have dinner with any historical figure, who would it be?',
  "What's a simple thing that makes you happy?",
]

const MAX_LENGTH = 300

const PublicProfile = () => {
  const [isSending, setIsSending] = useState(false)

  // suggestion streaming state
  const [completion, setCompletion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const form = useForm<FormValue>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: '' },
  })
  const content = form.watch('content') ?? ''
  const progress = Math.min(100, (content.length / MAX_LENGTH) * 100)
  const overLimit = content.length > MAX_LENGTH

  const params = useParams<{ username: string }>()
  const username = params.username
  const complete = async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setCompletion('')
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch('/api/suggest-messages', {
        method: 'POST',
        signal: controller.signal,
      })

      if (!res.ok) {
        const body = await res.text()
        const isHtml = body.trimStart().startsWith('<')
        throw new Error(
          isHtml
            ? `Request failed (${res.status}). The route may be missing or blocked.`
            : body.slice(0, 160) || `Request failed (${res.status})`
        )
      }
      if (!res.body) throw new Error('Empty response from server')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
        setCompletion(text)
      }

      if (!text.trim()) throw new Error('The model returned an empty answer. Try again.')
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Suggestion error:', err)
        setError((err as Error).message || 'Could not load suggestions')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const stop = () => abortRef.current?.abort()

  const streamed = completion
    .split('||')
    .map((q) => q.trim())
    .filter(Boolean)
    .slice(0, 3)

  const showStarters = streamed.length === 0 && !isLoading
  const suggestions = showStarters ? INITIAL_SUGGESTIONS : streamed
  const placeholders = isLoading ? Math.max(0, 3 - streamed.length) : 0

  const pickSuggestion = (text: string) => {
    form.setValue('content', text, { shouldValidate: true, shouldDirty: true })
  }

  const onSubmit = async (data: FormValue) => {
    setIsSending(true)
    try {
      const response = await axios.post<ApiResponse>('/api/send-message', {
        ...data,
        username,
      })
      toast.add({ title: response.data.message })
      form.reset({ content: '' })
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>
      const status = axiosError.response?.status
      console.error('send-message failed:', status, axiosError.response?.data ?? axiosError.message)
      toast.add({
        title: 'Message not sent',
        description:
          axiosError.response?.data?.message ??
          (status ? `Request failed (${status})` : axiosError.message),
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 px-4 py-8 sm:px-6 lg:flex lg:items-center">
      {/* decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-fuchsia-300/30 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-5xl">
        {/* Header */}
        <header className="mb-8 flex flex-col items-center text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 opacity-40 blur-md" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-fuchsia-600 text-2xl font-bold uppercase text-white shadow-lg ring-4 ring-white">
              {username}
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Send an anonymous message
          </h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            to <span className="font-semibold text-slate-800">@{username}</span> · your identity stays hidden
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Message form */}
          <section className="flex flex-col rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-indigo-500/10 backdrop-blur-xl sm:p-7">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-1 flex-col gap-5"
              noValidate
            >
              <FieldGroup className="flex-1">
                <Controller
                  control={form.control}
                  name="content"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="flex h-full flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="content" className="text-sm font-semibold text-slate-800">
                          Your message
                        </FieldLabel>
                        <span
                          className={`text-xs font-medium tabular-nums ${overLimit ? 'text-red-500' : 'text-slate-400'
                            }`}
                        >
                          {content.length}/{MAX_LENGTH}
                        </span>
                      </div>

                      <Textarea
                        {...field}
                        id="content"
                        placeholder="Write something kind, curious or fun…"
                        aria-invalid={fieldState.invalid}
                        className="min-h-44 flex-1 resize-none rounded-2xl border-slate-200 bg-white px-4 py-3.5 text-[15px] leading-relaxed text-slate-900 shadow-inner shadow-slate-900/[0.02] transition placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-4 focus-visible:ring-indigo-500/15 aria-invalid:border-red-400 aria-invalid:ring-4 aria-invalid:ring-red-500/10"
                      />

                      {/* progress bar */}
                      <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${overLimit ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-fuchsia-500'
                            }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} className="text-xs font-medium text-red-500" />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

              <Button
                type="submit"
                disabled={isSending || !content.trim() || overLimit}
                className="h-12 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send message
                  </>
                )}
              </Button>
            </form>
          </section>

          {/* Suggestions */}
          <section className="flex flex-col rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-fuchsia-500/10 backdrop-blur-xl sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-fuchsia-500 text-white">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  Need inspiration?
                </h2>
                <p className="mt-1 text-xs text-slate-500">Tap a suggestion to use it.</p>
              </div>

              {isLoading ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={stop}
                  className="h-9 shrink-0 rounded-full border-slate-200 bg-white px-4 text-slate-700 hover:bg-slate-50"
                >
                  <Square className="mr-2 h-3.5 w-3.5 fill-current" />
                  Stop
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => complete()}
                  className="h-9 shrink-0 rounded-full border-indigo-200 bg-indigo-50 px-4 text-indigo-700 hover:bg-indigo-100"
                >
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Suggest new
                </Button>
              )}
            </div>

            <ul className="space-y-3">
              {suggestions.map((text, i) => {
                const stillTyping = isLoading && i === streamed.length - 1
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => pickSuggestion(text)}
                      disabled={stillTyping}
                      className="group flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left text-sm leading-relaxed text-slate-700 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/10 active:translate-y-0 disabled:cursor-default disabled:hover:translate-y-0 disabled:hover:border-slate-200 disabled:hover:shadow-none"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-bold text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                        {i + 1}
                      </span>
                      <span>
                        {text}
                        {stillTyping && (
                          <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-indigo-500" />
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}

              {Array.from({ length: placeholders }).map((_, i) => (
                <li key={`ph-${i}`}>
                  <div className="h-[54px] animate-pulse rounded-2xl border border-slate-100 bg-slate-100/70" />
                </li>
              ))}
            </ul>

            {error && (
              <p className="mt-4 break-words rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-600">
                {error}
              </p>
            )}
          </section>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Want your own message board?{' '}
          <Link
            href="/sign-up"
            className="font-semibold text-indigo-600 underline-offset-4 hover:underline"
          >
            Create your account
          </Link>
        </p>
      </div>
    </main>
  )
}

export default PublicProfile