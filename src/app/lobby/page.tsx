"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LobbyPage() {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Kullanıcıyı al
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error(error);
        return;
      }
      setUser(data.user);

      // Kullanıcı online olarak presence tablosuna ekle
      if (data.user) {
        await supabase.from("presence").upsert({
          user_id: data.user.id,
          last_seen: new Date().toISOString(),
        });
      }
    };

    getUser();

    // Temizlik → sayfadan çıkınca kendi kaydını sil
    return () => {
      if (user) {
        supabase.from("presence").delete().eq("user_id", user.id);
      }
    };
  }, []);

  // Realtime online kullanıcıları dinle
  useEffect(() => {
    const channel = supabase
      .channel("presence-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "presence" },
        async () => {
          // Tablo değiştiğinde online kullanıcıları tekrar çek
          const { data } = await supabase.from("presence").select(`
            user_id,
            last_seen,
            profiles (username, avatar_url)
          `);
          setOnlineUsers(data || []);
        }
      )
      .subscribe();

    // İlk yüklemede kullanıcıları getir
    const fetchOnline = async () => {
      const { data } = await supabase.from("presence").select(`
        user_id,
        last_seen,
        profiles (username, avatar_url)
      `);
      setOnlineUsers(data || []);
    };
    fetchOnline();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Logout butonu
  const handleLogout = async () => {
    if (user) {
      await supabase.from("presence").delete().eq("user_id", user.id);
    }
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">☕ Kafede Online Olanlar</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {onlineUsers.map((u, i) => (
          <div
            key={i}
            className="flex flex-col items-center bg-gray-800 p-4 rounded shadow"
          >
            <img
              src={u.profiles?.avatar_url || "/default-avatar.png"}
              alt="Avatar"
              className="w-20 h-20 rounded-full border-2 border-gray-600 object-cover"
            />
            <p className="mt-2 font-semibold">{u.profiles?.username || "Anonim"}</p>
          </div>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-500 px-6 py-2 rounded hover:bg-red-600 transition mt-6"
      >
        Çıkış Yap
      </button>
    </div>
  );
}
