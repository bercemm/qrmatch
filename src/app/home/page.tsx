"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"

export default function HomePage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white gap-4">
      {user ? (
        <>
          <h1 className="text-3xl font-bold">
            Hoş geldin {user.user_metadata?.username || "Kullanıcı"}!!
          </h1>
          <img
            src={user.user_metadata?.avatar_url || "/default-avatar.png"}
            alt="Profil Fotoğrafı"
            className="w-32 h-32 rounded-full object-cover border-2 border-white"
          />
          <p className="text-lg mt-4">Hoş buldumm 🤍</p>
        </>
      ) : (
        <p>Yükleniyor...</p>
      )}
    </div>
  )
}
