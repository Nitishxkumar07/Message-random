'use client'
import MessageCard from "@/components/MessageCard"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
import { Message } from "@/model/User"
import { AcceptMessageSchema } from "@/schemas/aceeptmesssageSchema"
import { ApiResponse } from "@/types/Apiresponse"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { Loader2, RefreshCcw, Copy, Inbox } from "lucide-react"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"

type Props = {
  baseUrl: string
  username?: string
}

const DashboardClient = ({ baseUrl, username: usernameProp }: Props) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchedLoading, setIsSwitchedLoading] = useState(false)

  const { data: session } = useSession()

  const handleDEleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((message) => message._id.toString() !== messageId))
  }

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  })
  const { register, watch, setValue } = form

  const acceptMessages = watch('acceptMessages')

  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchedLoading(true)
    try {
      const response = await axios.get('/api/accept-message')
      setValue('acceptMessages', response.data.isAcceptingMessages)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.add({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to fetch message setting",
      })
    } finally {
      setIsSwitchedLoading(false)
    }
  }, [setValue])

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true)
    try {
      const response = await axios.get<ApiResponse>('/api/get-messages')
      setMessages(response.data.messages || [])
      if (refresh) {
        toast.add({
          title: "Refreshed Messages",
          description: "Showing latest messages",
        })
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.add({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to fetch messages",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!session || !session.user) return
    fetchMessages()
    fetchAcceptMessage()
  }, [session, fetchAcceptMessage, fetchMessages])

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-message', {
        acceptMessages: !acceptMessages,
      })
      setValue('acceptMessages', !acceptMessages)
      toast.add({
        title: response.data.message,
      })
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.add({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to update message setting",
      })
    }
  }

  // username comes from the server first, session is the fallback
  const username = usernameProp ?? session?.user?.username
  const profileUrl = `${baseUrl}/u/${username}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      toast.add({
        title: "Link copied",
        description: "Link copied to clipboard successfully",
      })
    } catch {
      toast.add({
        title: "Copy failed",
        description: "Could not copy the link",
      })
    }
  }

  if (!session || !session.user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100 max-w-sm w-full mx-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm">Please Login to access your user dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 md:p-8 bg-white rounded-xl shadow-sm border border-gray-100 w-full max-w-6xl">
      {/* Header */}
      <div className="border-b border-gray-100 pb-5 mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
          User Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your mystery feedback link and view incoming messages.
        </p>
      </div>

      {/* Profile URL Copy Section */}
      <div className="mb-6 bg-gray-50/80 p-4 rounded-lg border border-gray-200/60">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
          Copy Your Unique Link
        </h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="w-full p-2.5 text-sm bg-white border border-gray-300 rounded-md text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 select-all"
          />
          <Button
            onClick={copyToClipboard}
            className="shrink-0 bg-gray-900 hover:bg-gray-800 text-white font-medium px-5 flex items-center justify-center gap-2 transition-colors"
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
        </div>
      </div>

      {/* Accept Messages Switch Toggle */}
      <div className="mb-6 flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-2xs">
        <Switch
          checked={acceptMessages ?? false}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchedLoading}
          className="data-[state=checked]:bg-indigo-600"
        />
        <span className="text-sm font-medium text-gray-700 select-none">
          Accept Messages: {' '}
          <span className={`font-semibold ${acceptMessages ? 'text-indigo-600' : 'text-gray-400'}`}>
            {acceptMessages ? 'On' : 'Off'}
          </span>
        </span>
      </div>

      <Separator className="my-6 bg-gray-100" />

      {/* Refresh Button & Messages Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Inbox className="h-5 w-5 text-gray-500" />
          Received Messages
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            fetchMessages(true)
          }}
          className="hover:bg-gray-50 border-gray-300 text-gray-700 transition-colors"
          title="Refresh Messages"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
          ) : (
            <RefreshCcw className="h-4 w-4 text-gray-600" />
          )}
        </Button>
      </div>

      {/* Messages Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={message._id.toString()}
              message={message}
              onMessageDelete={handleDEleteMessage}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
            <Inbox className="mx-auto h-10 w-10 text-gray-300 mb-2" />
            <p className="text-gray-500 font-medium">No messages to display.</p>
            <p className="text-xs text-gray-400 mt-1">Share your link to start receiving anonymous feedback!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardClient