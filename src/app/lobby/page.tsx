"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LobbyPage() {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Kullanıcıyı al ve presence’a ekle
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error(error);
        return;
      }
      setUser(data.user);

      if (data.user) {
        // Online ekle
        await supabase.from("presence").upsert({
          user_id: data.user.id,
          last_seen: new Date().toISOString(),
        });
      }
    };

    getUser();

    // Çıkarken kaydı sil
    return () => {
      if (user) {
        supabase.from("presence").delete().eq("user_id", user.id);
      }
    };
  }, []);

  // Heartbeat → her 30 sn last_seen güncelle
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      await supabase
        .from("presence")
        .update({ last_seen: new Date().toISOString() })
        .eq("user_id", user.id);
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // Realtime dinleme
  useEffect(() => {
    const channel = supabase
      .channel("presence-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "presence" },
        async () => {
          await fetchOnline();
        }
      )
      .subscribe();

    // İlk açılışta getir
    fetchOnline();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Online kullanıcıları getir (son 60 sn aktif olanlar)
  const fetchOnline = async () => {
    const { data, error } = await supabase
      .from("presence")
      .select(`
        user_id,
        last_seen,
        profiles(username, avatar_url)
      `)
      .gte("last_seen", new Date(Date.now() - 60 * 1000).toISOString());

    if (!error) {
      setOnlineUsers(data || []);
    }
  };

  // Logout
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
            <p className="mt-2 font-semibold">
              {u.profiles?.username || "Anonim"}
            </p>
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
