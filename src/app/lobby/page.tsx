"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  username: string
  avatar_url: string | null
}

export default function LobbyPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")

    if (!error) setProfiles(data || [])
  }

  useEffect(() => {
    fetchProfiles()

    const channel = supabase
      .channel("profiles-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        fetchProfiles()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/") // auth sayfasına yönlendir
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      <div className="flex w-full justify-between items-center mb-6 max-w-4xl">
        <h1 className="text-2xl font-bold">👥 Lobi</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Çıkış Yap
        </button>
      </div>

      {profiles.length === 0 ? (
        <p className="text-gray-400">Henüz kimse yok...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="flex flex-col items-center bg-gray-900 p-4 rounded-lg shadow-md hover:scale-105 transition"
            >
              <img
                src={profile.avatar_url || "/default-avatar.png"}
                alt={profile.username || "Kullanıcı"}
                className="w-20 h-20 rounded-full object-cover mb-2 border border-gray-700"
              />
              <p className="font-semibold">{profile.username || "Bilinmeyen"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
