'use client'
import { useState } from "react"
import axios, { AxiosError } from "axios"
import { Loader2, Trash2 } from "lucide-react"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "./ui/button"
import { toast } from "./ui/toast"
import { Message } from "@/model/User"
import { ApiResponse } from "@/types/Apiresponse"

type MessageCardProp = {
    message: Message,
    onMessageDelete: (messageId: string) => void
}

const formatDate = (value: Date | string) =>
    new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value))

const MessageCard = ({ message, onMessageDelete }: MessageCardProp) => {
    const [isDeleting, setIsDeleting] = useState(false)

    const hanleDeleteconfirm = async () => {
        setIsDeleting(true)
        try {
            const response = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`)
            toast.add({
                title: response.data.message
            })
            onMessageDelete(message._id.toString())
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast.add({
                title: "Error",
                description: axiosError.response?.data.message ?? "Failed to delete message",
            })
            setIsDeleting(false)
        }
    }

    return (
        <Card className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white py-0 shadow-sm ring-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            {/* accent bar */}
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-slate-900 to-slate-500" />

            <CardContent className="px-6 pb-4 pt-5 pl-7">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    Strangers Feedback
                </p>
                <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-slate-800">
                    {message.content}
                </p>
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-3 pl-7">
                <time
                    dateTime={new Date(message.createdAt).toISOString()}
                    className="text-xs text-slate-400"
                >
                    {formatDate(message.createdAt)}
                </time>

                <AlertDialog>
                    <AlertDialogTrigger
                        render={
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={isDeleting}
                                className="h-8 rounded-lg px-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                aria-label="Delete message"
                            />
                        }
                    >
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This message will be permanently
                                removed from your inbox.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={hanleDeleteconfirm}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    )
}

export default MessageCard