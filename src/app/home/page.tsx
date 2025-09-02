"use client"

import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  const handleGoToLobby = () => {
    router.push("/lobby")
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white gap-6">
      <h1 className="text-3xl font-bold">🎉 Hoş geldin!</h1>
      <button
        onClick={handleGoToLobby}
        className="bg-green-500 px-6 py-3 rounded-lg text-lg hover:bg-green-600 transition"
      >
        Hoş buldum
      </button>
    </div>
  )
}
