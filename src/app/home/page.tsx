"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"

export default function HomePage() {
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setProfile(user.user_metadata)
      }
    }

    getProfile()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <h1 className="text-3xl font-bold mb-4">
        Hoş geldin {profile?.username || "Misafir"}!!
      </h1>

      {profile?.avatar_url && (
        <img
          src={profile.avatar_url}
          alt="Avatar"
          className="w-24 h-24 rounded-full mb-4"
        />
      )}

      <p className="text-lg">Hoş buldum 💙</p>
    </div>
  )
}
