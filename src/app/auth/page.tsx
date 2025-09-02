"use client"

import { useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const router = useRouter()

  // giriş state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // kayıt state
  const [username, setUsername] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [avatar, setAvatar] = useState<File | null>(null)

  // giriş yap
  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    })

    if (error) {
      alert("Giriş hatası: " + error.message)
    } else {
      router.push("/home") // ✅ sadece girişte yönlendir
    }
  }

  // kayıt ol
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (registerPassword !== confirmPassword) {
      alert("Şifreler uyuşmuyor!")
      return
    }

    let avatarUrl = null

    if (avatar) {
      const fileExt = avatar.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatar)

      if (uploadError) {
        console.error("Dosya yüklenemedi:", uploadError)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath)

      avatarUrl = publicUrlData.publicUrl
    }

    const { data, error } = await supabase.auth.signUp({
      email: registerEmail,
      password: registerPassword,
    })

    if (error) {
      alert("Kayıt hatası: " + error.message)
      return
    }

    const { data: user } = await supabase.auth.getUser()

    if (user?.user) {
      await supabase.from("profiles").insert({
        id: user.user.id,
        username: username,
        avatar_url: avatarUrl,
      })
    }

    alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz ✅")
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-8 bg-black text-white">
      <h1 className="text-2xl font-bold">Giriş ve Kayıt</h1>

      {/* Giriş Formu */}
      <div className="flex flex-col gap-2 bg-gray-900 p-4 rounded w-80">
        <h2 className="text-lg font-semibold">Giriş Yap</h2>
        <input
          type="email"
          placeholder="Email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          className="p-2 rounded text-black"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          className="p-2 rounded text-black"
        />
        <button
          onClick={handleSignIn}
          className="bg-blue-500 px-4 py-2 rounded"
        >
          Giriş Yap
        </button>
      </div>

      {/* Kayıt Formu */}
      <form
        onSubmit={handleSignUp}
        className="flex flex-col gap-2 bg-gray-900 p-4 rounded w-80"
      >
        <h2 className="text-lg font-semibold">Kayıt Ol</h2>
        <input
          type="text"
          placeholder="Adınız"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 rounded text-black"
        />
        <input
          type="email"
          placeholder="Email"
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
          className="p-2 rounded text-black"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
          className="p-2 rounded text-black"
        />
        <input
          type="password"
          placeholder="Şifre Tekrar"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="p-2 rounded text-black"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
          className="p-2 rounded text-white"
        />
        <button
          type="submit"
          className="bg-green-500 px-4 py-2 rounded"
        >
          Kayıt Ol
        </button>
      </form>
    </div>
  )
}
