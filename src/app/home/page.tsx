"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import type { User } from "@supabase/supabase-js"  // ✅ User tipini import ettik

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null) // ✅ any yerine User | null

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user ?? null)
    }
    getUser()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">✨ Hoş geldin!! ✨</h1>

      {user && (
        <div className="flex flex-col items-center gap-4">
          <img
            src={user.user_metadata?.avatar_url || "/default-avatar.png"}
            alt="Profil Fotoğrafı"
            className="w-28 h-28 rounded-full border border-gray-700 object-cover shadow-lg"
          />
          <p className="text-xl font-semibold">
            {user.user_metadata?.username || "Kullanıcı"}
          </p>
          <button className="bg-green-500 px-6 py-2 rounded hover:bg-green-600 transition">
            Hoş buldum 💚
          </button>
        </div>
      )}
    </div>
  )
}
