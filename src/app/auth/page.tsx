"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthPage() {
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState("");
  const [signupAvatar, setSignupAvatar] = useState<File | null>(null);

  // Login
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) {
      alert("Giriş hatası: " + error.message);
    } else {
      alert("Başarıyla giriş yaptın!");
    }
  };

  // Signup
  const handleSignup = async () => {
    if (signupPassword !== signupPasswordConfirm) {
      alert("Şifreler uyuşmuyor!");
      return;
    }

    // Önce kullanıcıyı oluştur
    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
    });

    if (error) {
      alert("Kayıt hatası: " + error.message);
      return;
    }

    let avatarUrl = null;

    // Fotoğraf varsa storage'a yükle
    if (signupAvatar) {
      const fileName = `${data.user?.id}-${signupAvatar.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, signupAvatar);

      if (uploadError) {
        alert("Fotoğraf yükleme hatası: " + uploadError.message);
      } else {
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);
        avatarUrl = urlData.publicUrl;
      }
    }

    // Profiles tablosuna kaydet
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          user_id: data.user.id,
          username: signupName,
          avatar_url: avatarUrl,
        },
      ]);

      if (profileError) {
        alert("Profil kaydedilemedi: " + profileError.message);
      } else {
        alert("Kayıt başarılı!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-10">
      <h1 className="text-3xl font-bold">QR Match</h1>

      {/* Login Form */}
      <div className="bg-gray-800 p-6 rounded w-80 flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Giriş Yap</h2>
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
          onClick={handleLogin}
          className="bg-blue-600 py-2 rounded hover:bg-blue-700"
        >
          Giriş Yap
        </button>
      </div>

      {/* Signup Form */}
      <div className="bg-gray-800 p-6 rounded w-80 flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Kayıt Ol</h2>
        <input
          type="text"
          placeholder="Kullanıcı adı"
          value={signupName}
          onChange={(e) => setSignupName(e.target.value)}
          className="p-2 rounded text-black"
        />
        <input
          type="email"
          placeholder="Email"
          value={signupEmail}
          onChange={(e) => setSignupEmail(e.target.value)}
          className="p-2 rounded text-black"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={signupPassword}
          onChange={(e) => setSignupPassword(e.target.value)}
          className="p-2 rounded text-black"
        />
        <input
          type="password"
          placeholder="Şifre (Tekrar)"
          value={signupPasswordConfirm}
          onChange={(e) => setSignupPasswordConfirm(e.target.value)}
          className="p-2 rounded text-black"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setSignupAvatar(e.target.files ? e.target.files[0] : null)
          }
          className="p-2 rounded text-white bg-gray-700"
        />
        <button
          onClick={handleSignup}
          className="bg-green-600 py-2 rounded hover:bg-green-700"
        >
          Kayıt Ol
        </button>
      </div>
    </div>
  );
}
