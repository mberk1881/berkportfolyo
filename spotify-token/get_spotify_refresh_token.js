const express = require('express');
const axios = require('axios');
const open = require('open');
const querystring = require('querystring');

const app = express();

// 🔐 KENDİ BİLGİLERİNİ BURAYA YAZ
const CLIENT_ID = 'a0c04528cb404bb08238cbf15a79f2e7';
const CLIENT_SECRET = '2f72a6af6a8941a58b6645c31d40d84d';
const REDIRECT_URI = 'http://127.0.0.1:8000/callback'; // YENİ URL
const SCOPES = 'user-read-currently-playing';
const PORT = 8000; // 8000'e çekildi

const AUTH_URL = `https://accounts.spotify.com/authorize?${querystring.stringify({
  response_type: 'code',
  client_id: CLIENT_ID,
  scope: SCOPES,
  redirect_uri: REDIRECT_URI,
})}`;

app.get('/', (req, res) => {
  console.log('Spotify yetkilendirme başlatılıyor...');
  res.send('Spotify yetkilendirme sayfasına yönlendiriliyorsunuz...');
  open(AUTH_URL);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  const error = req.query.error || null;

  if (error) {
    console.error('Yetkilendirme hatası:', error);
    res.send(`Hata: ${error}`);
    return;
  }

  if (!code) {
    console.error('Kod bulunamadı');
    res.send('Hata: Kod eksik');
    return;
  }

  console.log('Kod alındı:', code);

  try {
    console.log('Token alınıyor...');
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token } = response.data;
    console.log('\n--- SPOTIFY TOKENLAR ---');
    console.log('Access Token:', access_token);
    console.log('Refresh Token:', refresh_token);
    console.log('\n⚠️ BU REFRESH TOKEN’I .env DOSYANA KOPYALAMAYI UNUTMA ⚠️');
    res.send('✔️ Token’lar başarıyla alındı. Terminali kontrol et.');
  } catch (err) {
    console.error('Token alırken hata:', err.response ? err.response.data : err.message);
    res.send('Token alırken hata oluştu, terminali kontrol et.');
  }
});

app.listen(PORT, () => {
  console.log(`Server çalışıyor: http://127.0.0.1:${PORT}`);
  console.log('Tarayıcıda / adresine giderek Spotify yetkilendirmesini başlatabilirsin.');
});
