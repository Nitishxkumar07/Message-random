// src/app/(app)/dashboard/page.tsx
import { Suspense } from 'react'
import { headers } from 'next/headers'
import { auth } from '@/auth'
import DashboardClient from './DashboardClient'

async function DashboardContent() {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto =
    h.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https')

  const session = await auth()

  return (
    <DashboardClient
      baseUrl={`${proto}://${host}`}
      username={session?.user?.username}
    />
  )
}

function DashboardSkeleton() {
  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto w-full max-w-6xl animate-pulse space-y-4 rounded-xl border border-gray-100 bg-white p-6 md:p-8">
      <div className="h-9 w-56 rounded-md bg-gray-100" />
      <div className="h-4 w-80 max-w-full rounded-md bg-gray-100" />
      <div className="h-24 rounded-lg bg-gray-50" />
      <div className="h-12 rounded-lg bg-gray-50" />
      <div className="h-40 rounded-lg bg-gray-50" />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}