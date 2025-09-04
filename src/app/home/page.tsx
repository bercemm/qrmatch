"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Kullanıcı alınamadı:", error.message);
      } else {
        setUser(data?.user || null);

        // 🔥 Debug için log ekledim
        console.log("👤 Kullanıcı metadata:", data?.user?.user_metadata);
        console.log("📸 Avatar URL:", data?.user?.user_metadata?.avatar_url);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
      {user ? (
        <>
          {/* Başlık + isim */}
          <h1 className="text-3xl font-bold text-center">
            ✨ Hoş geldin {user.user_metadata?.username || "Kullanıcı"}!! ✨
          </h1>

          {/* Profil fotoğrafı */}
          <img
            src={
              user.user_metadata?.avatar_url && user.user_metadata.avatar_url.length > 0
                ? user.user_metadata.avatar_url
                : "/default-avatar.png"
            }
            alt="Profil Fotoğrafı"
            className="w-32 h-32 rounded-full border-4 border-gray-700 object-cover shadow-lg"
          />

          {/* Hoş buldum butonu */}
          <button className="bg-green-500 px-6 py-2 rounded hover:bg-green-600 transition">
            Hoş buldum 💚
          </button>
        </>
      ) : (
        <p className="text-gray-400">Kullanıcı bulunamadı</p>
      )}
    </div>
  );
}
