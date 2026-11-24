<div align='center'>Nugget - Lawk</div>

<p align="center">
  <img src="https://files.catbox.moe/awpgjl.jpg" width="180" alt="Lawk Beta"/>
</p>

---
<div align='center'>

![license](https://img.shields.io/badge/license-MIT-blue.svg)
![source](https://img.shields.io/badge/source-GitHub-black.svg)
![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)

Pustaka WebSockets untuk berinteraksi dengan WhatsApp Web, dikelola dengan merek GrenXKontlV2.
Proyek ini merupakan fork yang dibangun di atas Baileys oleh WhiskeySockets.

</div>

---
```markdown
## Daftar Isi

- [Instalasi](#instalasi)
- [Impor](#impor)
- [Menghubungkan ke WhatsApp](#menghubungkan-ke-whatsapp)
- [Anti-Ban Sender](#anti-ban-sender)
- [Keep-Alive & Reconnect](#keep-alive--reconnect)
- [Menyimpan Data](#menyimpan-data)
- [Mengirim Pesan](#mengirim-pesan)
- [Helper sendMessage Sederhana](#helper-sendmessage-sederhana)
- [Fitur Gabungan (1.1.0)](#fitur-gabungan-110)
- [Catatan Chat Pribadi vs Grup](#catatan-chat-pribadi-vs-grup)
- [Kredit](#kredit)
- [Kontribusi](#kontribusi)
- [Disclaimer](#disclaimer)

---

## Instalasi

Membutuhkan Node.js 20+ (paket ini hanya ESM; lihat [Impor](#impor)).

Dari npm registry (setelah dipublikasikan):

```bash
npm install @grenxkontlv2/baileys
```

Langsung dari GitHub:

```bash
npm install github:GrenXKontlV2/Baileys
```

Atau tambahkan ke package.json secara manual:

```json
"dependencies": {
  "@grenxkontlv2/baileys": "latest"
}
```

Sudah punya bot yang dibangun dengan @whiskeysockets/baileys asli dan tidak ingin mengubah setiap
require/import di kodebase? Alias nama dependensinya saja, agar nama paket asli
mengarah ke fork ini:

```json
"dependencies": {
  "@whiskeysockets/baileys": "npm:@grenxkontlv2/baileys"
}
```

Dengan alias ini, tetap gunakan require('@whiskeysockets/baileys') di kode kamu — npm akan
mengarahkannya ke fork ini di balik layar.

Kamu juga bisa pin ke branch atau commit tertentu:

```bash
npm install github:GrenXKontlV2/Baileys#main
```

---

Impor

ESM (berfungsi di semua versi Node.js yang didukung):

```javascript
import makeWASocket, { Browsers, DisconnectReason } from '@grenxkontlv2/baileys';
```

CommonJS: paket ini hanya ESM, jadi require() hanya berfungsi di Node.js 22.12+ atau 20.19+
(dukungan require(esm) dari Node). Di versi lama, gunakan import.

```javascript
const {
  default: makeWASocket,
} = require('@grenxkontlv2/baileys');
```

---

Menghubungkan ke WhatsApp

Dengan QR Code

```javascript
const {
  default: makeWASocket,
  Browsers
} = require('@grenxkontlv2/baileys');

const client = makeWASocket({
  browser: Browsers.grenxkontlv2('Chrome')
});

client.ev.on('connection.update', ({ connection, qr }) => {
  if (qr) console.log('Scan string QR ini:', qr);
  if (connection === 'open') console.log('Terhubung');
});
```

Hubungkan dengan Pairing Code

```javascript
const {
  default: makeWASocket,
  fetchLatestWAWebVersion,
  Browsers
} = require('@grenxkontlv2/baileys');

async function start() {
  const { version } = await fetchLatestWAWebVersion();

  const client = makeWASocket({
    browser: Browsers.grenxkontlv2('Chrome'),
    printQRInTerminal: false,
    version,
    aiLabel: false
  });

  const number = "628XXXXXXXXXX";
  const code = await client.requestPairingCode(number.trim());

  console.log("Pairing code kamu: " + code);
}

start();
```

---

Anti-Ban Sender

Fitur ini mendeteksi sinyal banned / restricted / blocked dari server WhatsApp untuk nomor
pengirim (sender). Jika terdeteksi, koneksi langsung dilepas otomatis dan user diberi peringatan
agar segera mengganti/melepas sender, sehingga bot tidak terus memakai nomor yang sudah dibatasi.

Cara Kerja

· Deteksi dilakukan di handler CB:stream:error dan CB:failure.
· Keyword yang dianggap banned: banned, ban, restricted, blocked, account_locked,
sender_banned, spam.
· Status code 401 (loggedOut) dan 403 juga dianggap banned.
· Saat terdeteksi, socket memancarkan event connection.update dengan payload senderBanned,
lalu memanggil end() dengan status loggedOut agar koneksi langsung diputus.

Menangkap Peringatan

```javascript
client.ev.on('connection.update', (update) => {
  if (update.senderBanned) {
    console.error('⚠️ SENDER DIBAN:', update.senderBanned.reason);
    console.error('Detail:', update.senderBanned.detail);
    console.error('Pesan:', update.senderBanned.message);
  }

  if (update.connection === 'close') {
    const statusCode = update.lastDisconnect?.error?.output?.statusCode;
    if (statusCode === DisconnectReason.loggedOut) {
      console.log('Koneksi ditutup (loggedOut). Sender dilepas.');
    }
  }
});
```

Payload senderBanned

Field Tipe Keterangan
senderBanned boolean Selalu true saat event ini dipancarkan
reason string Alasan singkat (mis. stream_error, failure, atau reason asli)
detail object Node/attrs asli dari server WhatsApp
message string Pesan peringatan siap tampil untuk user/admin
timestamp Date Waktu kejadian

Rekomendasi Tindakan

· Lepas sender dari daftar nomor aktif di sistem kamu.
· Jangan reconnect dengan kredensial yang sama; hapus folder auth bila perlu.
· Ganti nomor baru untuk bot.
· Kirim notifikasi ke admin/owner (mis. via webhook, Telegram, atau channel lain).
· Hentikan pengiriman massal sementara untuk menghindari ban berantai.

---

Keep-Alive & Reconnect

Keep-Alive Bawaan (Lebih Toleran)

Logika keep-alive di lib/Socket/socket.js sudah diperbaiki agar tidak mudah memutus koneksi:

· Timeout limit diubah dari keepAliveIntervalMs + 5000 menjadi
(keepAliveIntervalMs * 2) + 10000.
· Jika pengiriman ping gagal, koneksi tidak langsung diputus; hanya dicatat sebagai warning.
Koneksi baru diputus jika waktu timeoutLimit benar-benar terlampaui.

Atur interval di makeWASocket:

```javascript
const client = makeWASocket({
  keepAliveIntervalMs: 60000,
});
```

Reconnect Otomatis (Modul Pendukung)

Library ini tidak melakukan reconnect otomatis. Untuk koneksi yang lebih stabil, gunakan modul
pihak ketiga di lapisan aplikasi:

baileys-keep-alive

Menjaga koneksi tetap hidup dengan exponential backoff dan heartbeat.

```javascript
import { keepAlive } from 'baileys-keep-alive';

const ka = keepAlive(sock, {
  reconnectFactory: async () => makeWASocket({}),
  heartbeat: { intervalMs: 30000 }
});
```

baileys-antiban

Melindungi sesi dari reconnect loop dan korupsi kredensial.

```javascript
import { reconnectThrottle } from 'baileys-antiban';

const throttle = reconnectThrottle({ cooldownMs: 5000, maxConsecutive: 5 });
```

Hal Krusial yang Sering Terlewat

1. Selalu simpan kredensial: dengarkan event creds.update dan panggil saveCreds setiap kali
   event terpicu.
2. Jangan reconnect saat loggedOut (401): hapus folder auth dan minta scan QR baru.
3. Tangani restartRequired (515): setelah scan QR, WhatsApp memaksa disconnect. Ini normal;
   lakukan reconnect, bukan menganggapnya error.

---

Menyimpan Data

```javascript
const {
  default: makeWASocket,
  makeInMemoryStore
} = require('@grenxkontlv2/baileys');
const pino = require('pino');

const store = makeInMemoryStore({
  logger: pino().child({ level: 'silent', stream: 'store' })
});
const client = makeWASocket({});
store.bind(client.ev);

client.ev.on('contacts.upsert', () => {
  console.log('Kontak baru: ' + Object.values(store.contacts()));
});
```

---

Mengirim Pesan

Mengirim / Meneruskan Pesan dengan noSelfSync

noSelfSync adalah opsi relayMessage (hanya untuk chat pribadi/1-on-1) yang mengontrol apakah
pesan juga disinkronkan ke perangkat lain milikmu sendiri (ponsel lain/sesi WhatsApp Web yang
login ke akun yang sama). Ini tidak memengaruhi pengiriman ke penerima.

· noSelfSync: true — pesan dikirim ke penerima seperti biasa, tetapi tidak disinkronkan
ke perangkat lain milikmu. Berguna saat kamu tidak ingin pesan muncul di sesi lain yang tertaut
(misalnya pengiriman senyap/otomatis dari akun bot).
· noSelfSync: false (default) — perilaku normal. Pesan dikirim ke penerima dan juga
disinkronkan ke perangkat lain milikmu, sehingga muncul di semua tempat kamu login, seperti
mengirim dari aplikasi WhatsApp resmi.

```javascript
await client.relayMessage(m.chat, {
  conversation: "Hello from GrenXKontlV2"
}, {
  noSelfSync: true
});

await client.relayMessage(m.chat, {
  conversation: "Hello from GrenXKontlV2"
}, {
  noSelfSync: false
});

await client.sendMessage(m.chat, {
  text: "Hello from GrenXKontlV2"
}, {
  noSelfSync: true
});
```

Mengirim orderMessage

```javascript
const fs = require('fs');
const thumbnail = fs.readFileSync('./grenxkontlv2thumb.jpg');

await client.sendMessage(m.chat, {
  thumbnail,
  message: "Ringkasan pesanan",
  orderTitle: "Toko Saya",
  totalAmount1000: 72502,
  totalCurrencyCode: "IDR"
}, { quoted: m });
```

Mengirim pollResultSnapshotMessage

```javascript
await client.sendMessage(m.chat, {
  pollResultMessage: {
    name: "Polling Saya",
    options: [
      { optionName: "Opsi 1" },
      { optionName: "Opsi 2" }
    ],
    newsletter: {
      newsletterName: "0X8 - Society",
      newsletterJid: "120363424944937940@newsletter"
    }
  }
});
```

Mengirim productMessage

```javascript
await client.relayMessage(m.chat, {
  productMessage: {
    title: "Produk.pdf",
    description: "Deskripsi produk",
    thumbnail: { url: "./grenxkontlv2thumb.jpg" },
    productId: "EXAMPLE_TOKEN",
    retailerId: "EXAMPLE_RETAILER_ID",
    url: "https://example.com",
    body: "Teks body",
    footer: "Footer",
    buttons: [
      {
        name: "cta_url",
        buttonParamsJson: "{\"display_text\":\"Kunjungi\",\"url\":\"https://example.com\"}"
      }
    ],
    priceAmount1000: 72502,
    currencyCode: "IDR"
  }
});
```

Mengirim interactiveMessage

```javascript
await client.sendMessage(m.chat, {
  image: { url: "./grenxkontlv2img.jpg" },
  text: "body",
  title: "title",
  footer: "footer",
  interactiveButtons: [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "\0"
      })
    }
  ],
  messageParams: JSON.stringify({
    bottom_sheet: {}
  })
});
```

Mengirim Label Anggota

```javascript
await client.sendMessage(m.chat, {
  groupLabel: {
    labelText: "Anggota yang di-tag muncul di sini"
  }
});
```

Mengirim Pesan ke Anggota Grup

```javascript
await client.sendMessageMembers(m.chat, {
  extendedTextMessage: {
    text: "Halo anggota"
  }
}, {});
```

---

Helper sendMessage Sederhana

Mengirim Teks

```javascript
await client.sendText(m.chat, "Halo!", {
  contextInfo: {
    mentionedJid: [m.chat]
  }
}, {
  key: {
    remoteJid: "status@broadcast",
    participant: m.sender,
    fromMe: true
  },
  message: {
    conversation: "\0"
  }
});
```

Mengirim Gambar

```javascript
await client.sendImage(m.chat, { url: "./grenxkontlv2img.jpg" }, "Caption", {
  contextInfo: {
    mentionedJid: [m.chat]
  }
}, {
  key: {
    remoteJid: "status@broadcast",
    participant: m.sender,
    fromMe: true
  },
  message: {
    conversation: "\0"
  }
});
```

Mengirim Video

```javascript
await client.sendVideo(m.chat, { url: "./video.mp4" }, "Caption", {
  contextInfo: {
    mentionedJid: [m.chat]
  }
}, {
  key: {
    remoteJid: "status@broadcast",
    participant: m.sender,
    fromMe: true
  },
  message: {
    conversation: "\0"
  }
});
```

Mengirim Audio

```javascript
await client.sendAudio(m.chat, { url: "./grenxkontlv2audio.mp3" }, {
  contextInfo: {
    mentionedJid: [m.chat]
  }
}, {
  key: {
    remoteJid: "status@broadcast",
    participant: m.sender,
    fromMe: true
  },
  message: {
    conversation: "\0"
  }
});
```

Mengirim Lokasi

```javascript
await client.sendLocation(m.chat, "Caption", 90.0, 90.0, "https://example.com", "1234567890", {
  contextInfo: {
    mentionedJid: [m.chat]
  }
}, {
  key: {
    remoteJid: "status@broadcast",
    participant: m.sender,
    fromMe: true
  },
  message: {
    conversation: "\0"
  }
});
```

Mengirim Polling

```javascript
await client.sendPoll(m.chat, "Pilih satu", ["1", "2", "3"], true, {
  contextInfo: {
    mentionedJid: [m.chat]
  }
}, {
  key: {
    remoteJid: "status@broadcast",
    participant: m.sender,
    fromMe: true
  },
  message: {
    conversation: "\0"
  }
});
```

Mengirim Kuis

```javascript
await client.sendQuiz(m.chat, "Pertanyaan kuis", ["1", "2", "3"], "2", {
  contextInfo: {
    mentionedJid: [m.chat]
  }
}, {
  key: {
    remoteJid: "status@broadcast",
    participant: m.sender,
    fromMe: true
  },
  message: {
    conversation: "\0"
  }
});
```

Mengirim Status Mention

```javascript
await client.statusMention(m.chat, {
  extendedTextMessage: {
    text: "Di-mention di status"
  }
});
```

---

Fitur Gabungan (1.1.0)

GrenXKontlV2 1.1.0 menggabungkan lapisan tambahan dari fork wbails di atas inti GrenXKontlV2:

· Lapisan privasi, interop, GraphQL/Wamo, dan message-builder sock.* (lihat
lib/Socket/privacy.js, interop.js, graphql.js, message-builder.js).
· Protokol USync tambahan: business, picture, text status, sidelist, feature (lib/WAUSync/).
· Pesan sticker pack ({ stickerPacks: {...} }) dan helper metadata stiker
(lib/Utils/sticker.js, membutuhkan ffmpeg di PATH untuk konversi stiker).
· useSqliteAuthState (membutuhkan Node 22.5+ karena memakai node:sqlite; dimuat secara lazy,
jadi Node 20 tidak terpengaruh kecuali kamu memanggilnya).
· Helper persistensi makeInMemoryStore: writeToFile, readFromFile, writeToFileInterval.
· Fallback cstoken 1:1: menyimpan salt NCT dari sinkronisasi app-state dan melampirkan cstoken
pada pengiriman privat yang tidak memiliki tctoken. Nonaktifkan per pesan dengan
{ cstoken: false }.

Implementasi newsletter adalah milik WaBail (lib/Socket/newsletter.js) dan dipakai tanpa perubahan.

Fitur Baru di Versi Ini

· Anti-Ban Sender: deteksi otomatis banned/restricted/blocked, lepas sender, dan peringatan
user lewat event connection.update. Lihat Anti-Ban Sender.
· Keep-Alive Lebih Toleran: timeout limit diperpanjang dan kegagalan ping tidak langsung
memutus koneksi. Lihat Keep-Alive & Reconnect.

---

Catatan Chat Pribadi vs Grup

· Balas ke msg.key.remoteJid apa adanya. Di chat pribadi bisa berupa @lid; bentuk nomor
telepon ada di msg.key.remoteJidAlt.
· Di grup, pengirim adalah msg.key.participant (alternatifnya di msg.key.participantAlt).
· Jika pengiriman ke pengguna tidak dapat menemukan perangkat penerima, relayMessage sekarang
melempar 421 alih-alih diam-diam melaporkan sukses.

---

Kredit

GrenXKontlV2 adalah fork dari Baileys, yang awalnya dibuat oleh
Adhiraj Singh dan dikelola oleh komunitas WhiskeySockets.
Semua kredit untuk implementasi protokol dasar diberikan kepada penulis dan kontributor asli.
Lihat LICENSE untuk teks lisensi lengkap dan pemberitahuan hak cipta.

---

Kontribusi

Lihat CONTRIBUTING.md untuk panduan melaporkan masalah dan mengirim pull request.

---

Disclaimer

Ini bukan produk resmi WhatsApp. Penggunaan library ini untuk mengirim pesan massal atau tidak diminta
dapat melanggar Ketentuan Layanan WhatsApp dan dapat menyebabkan nomor kamu diblokir. Gunakan dengan bijak.
