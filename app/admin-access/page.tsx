'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminAccess() {
  const router = useRouter()
  const [password, setPassword] = useState('')

  const handleEnter = () => {
    if (password === 'admin123') {
      router.push('/admin')
    } else {
      alert('Wrong password')
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="p-8 border rounded-xl text-center w-80">
        <h1 className="text-2xl font-bold mb-4">
          Welcome Admin
        </h1>

        <input
          type="password"
          placeholder="Enter password"
          className="border p-2 mb-4 w-full"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={handleEnter}
          className="bg-black text-white px-4 py-2 w-full"
        >
          Continue
        </button>
      </div>
    </div>
  )
}