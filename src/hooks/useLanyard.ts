import { useState, useEffect } from "react";
import { DiscordUser } from "../types";

const DISCORD_ID = import.meta.env.VITE_DISCORD_ID;

export const useLanyard = () => {
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!DISCORD_ID) {
      setError("Discord ID bulunamadı (.env dosyanızı kontrol edin)");
      setLoading(false);
      return;
    }
    const fetchLanyardData = async () => {
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        if (!response.ok) throw new Error("Lanyard API hatası: " + response.statusText);
        const lanyardData = await response.json();
        if (!lanyardData.success) throw new Error("Lanyard API başarısız döndü");
        const user = lanyardData.data.discord_user;
        setDiscordUser({
          username: user.username || "Bilinmeyen Kullanıcı",
          discriminator: user.discriminator || "0000",
          id: user.id,
          avatar: user.avatar || null,
          banner_url: null, // Banner API'si kullanılmıyor, istersen ekleyebilirsin
          about: lanyardData.data.activities?.find((a: any) => a.type === 4)?.state || null,
          status: lanyardData.data.discord_status || "offline",
          activities: lanyardData.data.activities?.map((activity: any) => ({
            type: activity.type,
            name: activity.name,
            details: activity.details || null,
            state: activity.state || null,
            timestamps: activity.timestamps || null,
            assets: activity.assets || null,
          })) || [],
          badges: [
            { id: 'nitro', name: 'Discord Nitro', icon: 'https://discordresources.com/img/discordnitro.svg' },
            { id: 'active_developer', name: 'Active Developer', icon: 'https://discordresources.com/img/activedeveloper.svg' },
            { id: 'verified_developer', name: 'Verified Bot Developer', icon: 'https://discordresources.com/img/discordbotdev.svg' }
          ],
        });
      } catch (err: any) {
        setError(err.message || "Bilinmeyen hata");
      } finally {
        setLoading(false);
      }
    };
    fetchLanyardData();
  }, []);

  return { discordUser, loading, error };
};