"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const router = useRouter();

  // 📌 Giriş Yap
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      return;
    }
    router.push("/lobby");
  };

  // 📌 Kayıt Ol
  const handleRegister = async () => {
    // 1) Auth’a kullanıcı ekle
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;
    if (!user) {
      alert("Kullanıcı oluşturulamadı!");
      return;
    }

    // 2) Fotoğrafı storage’a yükle (opsiyonel)
    let avatarUrl = null;
    if (avatar) {
      const filePath = `avatars/${user.id}-${avatar.name}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatar);

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        avatarUrl = urlData.publicUrl;
      }
    }

    // 3) Profiles tablosuna kayıt ekle
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: user.id,
      username,
      avatar_url: avatarUrl,
    });

    if (profileError) {
      alert("Profil kaydedilemedi: " + profileError.message);
      return;
    }

    router.push("/lobby");
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded shadow-md w-96 space-y-6">
        <h1 className="text-2xl font-bold text-center">QR Match</h1>

        {/* Giriş Formu */}
        <div className="space-y-2">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 rounded bg-gray-800"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Şifre"
            className="w-full px-4 py-2 rounded bg-gray-800"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 py-2 rounded hover:bg-blue-600"
          >
            Giriş Yap
          </button>
        </div>

        {/* Kayıt Ol Formu */}
        <div className="border-t border-gray-700 pt-4 space-y-2">
          <input
            type="text"
            placeholder="Kullanıcı Adı"
            className="w-full px-4 py-2 rounded bg-gray-800"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 rounded bg-gray-800"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Şifre"
            className="w-full px-4 py-2 rounded bg-gray-800"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
            className="w-full"
          />
          <button
            onClick={handleRegister}
            className="w-full bg-green-500 py-2 rounded hover:bg-green-600"
          >
            Kayıt Ol
          </button>
        </div>
      </div>
    </div>
  );
}
