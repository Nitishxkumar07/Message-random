'use client'
import { signIn, signOut, useSession } from "next-auth/react"

export default function SignInPage() {
  const { data: session } = useSession()

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const result = await signIn("credentials", {
      identifier: formData.get("identifier"),
      password: formData.get("password"),
      redirect: false,
    })
    if (result?.error) {
      console.error("Login failed:", result.error)
      // TODO: Show error to user
    }
  }

  if (session) {
    return (
      <>
        Signed in as {session.user?.email || session.user?.username} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }

  return (
    <form onSubmit={handleSignIn}>
      <div>
        <label htmlFor="identifier">Email or Username</label>
        <input id="identifier" name="identifier" type="text" required />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />
      </div>
      <button type="submit">Sign in</button>
    </form>
  )
}
