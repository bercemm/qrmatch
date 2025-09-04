"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation"; // ✅ yönlendirme için

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // ✅ router tanımlandı

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Kullanıcı alınamadı:", error.message);
      } else {
        setUser(data?.user || null);

        // 🔥 Debug logları
        console.log("👤 user_metadata:", data?.user?.user_metadata);
        console.log(
          "👤 raw_user_meta_data:",
          (data?.user as any)?.raw_user_meta_data
        );
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

  // 🔥 Metadata'yı güvenli şekilde al
  const username =
    (user as any)?.raw_user_meta_data?.username ||
    user?.user_metadata?.username ||
    "Kullanıcı";

  const avatarUrl =
    (user as any)?.raw_user_meta_data?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    "/default-avatar.png";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
      {user ? (
        <>
          {/* Başlık + isim */}
          <h1 className="text-3xl font-bold text-center">
            ✨ Hoş geldin {username}!! ✨
          </h1>

          {/* Profil fotoğrafı */}
          <img
            src={avatarUrl}
            alt="Profil Fotoğrafı"
            className="w-32 h-32 rounded-full border-4 border-gray-700 object-cover shadow-lg"
          />

          {/* Hoş buldum butonu */}
          <button
            onClick={() => router.push("/lobby")} // ✅ tıklanınca lobby sayfasına git
            className="bg-green-500 px-6 py-2 rounded hover:bg-green-600 transition"
          >
            Hoş buldummm 💚
          </button>
        </>
      ) : (
        <p className="text-gray-400">Kullanıcı bulunamadı</p>
      )}
    </div>
  );
}
