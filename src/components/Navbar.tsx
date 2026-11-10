'use client'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import React from 'react'
import { User } from 'next-auth'
import { Button } from './ui/button'
const Navbar = () => {

    const { data: session } = useSession()
    const user: User = session?.user as User
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                <a href="/" className="text-lg font-semibold tracking-tight text-slate-900 transition-colors hover:text-slate-700">MSG Random</a>
                <div>
                    <div>
                        
                    </div>
                    {
                        session ? (
                            <div className="flex items-center gap-3 sm:gap-4">
                                <Link href={'/dashboard'}>Dashboard</Link>
                                <span className="hidden max-w-[12rem] truncate text-sm text-slate-500 sm:inline">Welcome, <span className="font-medium text-slate-900">{user?.username || user?.email}</span></span>
                                <Button onClick={() => signOut()} className="h-9 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]">Logout</Button>
                            </div>
                        ) : (
                            <Link href={'/sign-in'}><Button className="h-9 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]">Login</Button></Link>
                        )
                    }
                </div>
            </div>
        </nav>
    )
}

export default Navbar