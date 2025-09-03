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
    console.log("🔵 Giriş yap denendi:", loginEmail)
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    })

    if (error) {
      console.error("Giriş hatası:", error)
      alert("Giriş hatası: " + error.message)
    } else {
      router.push("/home") // ✅ giriş yapınca homee yönlendir
    }
  }

  // kayıt ol
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("🟢 Kayıt ol butonuna basıldı")

    if (registerPassword !== confirmPassword) {
      alert("Şifreler uyuşmuyor!")
      return
    }

    let avatarUrl = null

    // ✅ avatar yükleme
    if (avatar) {
      try {
        const fileExt = avatar.name.split(".").pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatar)

        if (uploadError) {
          console.error("Dosya yüklenemedi:", uploadError)
          alert("Dosya yüklenemedi: " + uploadError.message)
          return
        }

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath)

        avatarUrl = publicUrlData.publicUrl
      } catch (err) {
        console.error("Beklenmedik dosya yükleme hatası:", err)
      }
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            username: username,
            avatar_url: avatarUrl,
          },
        },
      })

      if (error) {
        console.error("Supabase kayıt hatası:", error)
        alert("Kayıt hatası: " + error.message)
        return
      }

      alert("✅ Kayıt başarılı! Şimdi giriş yapabilirsiniz.")
    } catch (err) {
      console.error("Beklenmedik hata:", err)
      alert("Beklenmedik hata oldu, konsolu kontrol et 🚨")
    }
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
          className="p-2 rounded text-white placeholder-white bg-gray-800"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          className="p-2 rounded text-white placeholder-white bg-gray-800"
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
          className="p-2 rounded text-white placeholder-white bg-gray-800"
        />
        <input
          type="email"
          placeholder="Email"
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
          className="p-2 rounded text-white placeholder-white bg-gray-800"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
          className="p-2 rounded text-white placeholder-white bg-gray-800"
        />
        <input
          type="password"
          placeholder="Şifre Tekrar"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="p-2 rounded text-white placeholder-white bg-gray-800"
        />

        <div className="flex flex-col gap-2">
          <label
            htmlFor="avatarUpload"
            className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer text-center"
          >
            📷 Fotoğraf Yükle!
          </label>
          <input
            id="avatarUpload"
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
            className="hidden"
          />
          {avatar && (
            <p className="text-sm text-green-400">Seçilen: {avatar.name}</p>
          )}
        </div>

        <button type="submit" className="bg-green-500 px-4 py-2 rounded">
          Kayıt Ol
        </button>
      </form>
    </div>
  )
}
