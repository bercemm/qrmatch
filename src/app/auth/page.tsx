"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);

  // 📌 Kullanıcı Kaydı
  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert("Kayıt hatası: " + error.message);
      return;
    }

    const user = data.user;
    if (!user) return;

    let avatar_url = null;

    // Fotoğraf yükleme
    if (avatar) {
      const filePath = `avatars/${user.id}-${avatar.name}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatar);

      if (uploadError) {
        alert("Fotoğraf yüklenemedi: " + uploadError.message);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      avatar_url = publicUrl.publicUrl;
    }

    // Profil tablosuna kayıt
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: user.id,
      username,
      avatar_url,
    });

    if (profileError) {
      alert("Profil kaydedilemedi: " + profileError.message);
      return;
    }

    alert("Kayıt başarılı! Giriş yapabilirsiniz.");
  };

  // 📌 Kullanıcı Girişi
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Giriş hatası: " + error.message);
      return;
    }

    alert("Giriş başarılı!");
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center gap-8">
      {/* Giriş Formu */}
      <div className="bg-gray-900 p-6 rounded w-80 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Giriş Yap</h2>
        <input
          type="email"
          placeholder="Email"
          className="p-2 rounded text-black"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Şifre"
          className="p-2 rounded text-black"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-blue-600 p-2 rounded hover:bg-blue-700"
        >
          Giriş Yap
        </button>
      </div>

      {/* Kayıt Formu */}
      <div className="bg-gray-900 p-6 rounded w-80 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Kayıt Ol</h2>
        <input
          type="text"
          placeholder="Kullanıcı Adı"
          className="p-2 rounded text-black"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="p-2 rounded text-black"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Şifre"
          className="p-2 rounded text-black"
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="file"
          className="p-2"
          onChange={(e) => setAvatar(e.target.files?.[0] || null)}
        />
        <button
          onClick={handleSignup}
          className="bg-green-600 p-2 rounded hover:bg-green-700"
        >
          Kayıt Ol
        </button>
      </div>
    </div>
  );
}
