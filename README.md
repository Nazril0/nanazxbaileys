<div align="center">

<img src="https://raw.githubusercontent.com/Nazril0/dataaaaaaa/refs/heads/main/nazx.jpg" height="150" style="border-radius:50%" alt="nazx"/>

# @nanazx/baileys

**WhatsApp Web API library — Original Baileys diperkuat dengan fitur tambahan oleh nazx.**

[![npm](https://img.shields.io/badge/npm-%40nanazx%2Fbaileys-CB3837?style=flat&logo=npm)](https://github.com/Nazril0/nanazxbaileys)
[![Node](https://img.shields.io/badge/Node.js-%3E%3D20-339933?style=flat&logo=node.js)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-Nazril0-181717?style=flat&logo=github)](https://github.com/Nazril0)
[![Instagram](https://img.shields.io/badge/Instagram-nazzxx._0-E4405F?style=flat&logo=instagram)](https://instagram.com/nazzxx._0)
[![TikTok](https://img.shields.io/badge/TikTok-nazxtampan__-000000?style=flat&logo=tiktok)](https://tiktok.com/@nazxtampan__)

</div>

---

## 📋 Index

- [Tentang](#-tentang)
- [Instalasi](#️-instalasi)
- [Quick Start](#-quick-start)
  - [QR Code](#connect-via-qr-code)
  - [Pairing Code](#connect-via-pairing-code)
  - [Full History](#receive-full-history)
- [Socket Config](#️-socket-config)
- [Simpan Session](#-simpan-session)
- [Handling Events](#-handling-events)
- [Sending Messages](#-sending-messages)
  - [Teks & Dasar](#teks--dasar)
  - [Quote / Reply](#quote--reply)
  - [Mention](#mention)
  - [Forward](#forward)
  - [Lokasi](#lokasi)
  - [Live Location](#live-location)
  - [Kontak](#kontak)
  - [Reaksi](#reaksi)
  - [Pin Pesan](#pin-pesan)
  - [Poll](#poll)
  - [Hapus Pesan](#hapus-pesan)
  - [Edit Pesan](#edit-pesan)
  - [Pesan Menghilang](#pesan-menghilang)
  - [Group Invite](#group-invite)
  - [Event / Jadwal](#event--jadwal)
  - [Share / Request Phone Number](#share--request-phone-number)
  - [Gambar](#gambar)
  - [Video](#video)
  - [Audio](#audio)
  - [Voice Note (PTT)](#voice-note-ptt)
  - [GIF](#gif)
  - [Video Note (PTV)](#video-note-ptv)
  - [Dokumen](#dokumen)
  - [Stiker](#stiker)
  - [View Once](#view-once)
  - [Album](#album)
  - [Status / Stories](#status--stories)
  - [Status dengan Mention](#status-dengan-mention)
  - [Group Story](#group-story)
  - [Link Preview](#link-preview)
- [Buttons & Interactive](#-buttons--interactive)
  - [Reply Buttons](#reply-buttons)
  - [List Message](#list-message)
  - [Template Buttons](#template-buttons)
  - [Interactive Message (nativeFlow)](#interactive-message-nativeflow)
  - [Interactive Buttons (Baron)](#interactive-buttons-baron)
  - [Payment Request](#payment-request)
  - [Product Message](#product-message)
  - [Poll Result](#poll-result)
  - [Button Reply](#button-reply)
  - [List Reply](#list-reply)
- [relayMessage](#-relaymessage)
- [Download Media](#-download-media)
- [Re-upload Media](#-re-upload-media)
- [Read Messages](#-read-messages)
- [Presence](#-presence)
- [Groups](#-groups)
- [Newsletter (Channel)](#-newsletter-channel)
- [Community](#-community)
- [AI Groups](#-ai-groups)
- [Username WA](#-username-wa)
- [Privacy](#-privacy)
- [User & Profile](#-user--profile)
- [Modifikasi Chat](#-modifikasi-chat)
- [Panggilan](#-panggilan)
- [Decrypt Poll Votes](#-decrypt-poll-votes)
- [Custom Functionality](#-custom-functionality)
- [Struktur Library](#-struktur-library)
- [Credits](#-credits)
- [Kontak](#-kontak)

---

## 📖 Tentang

**@nanazx/baileys** adalah library WhatsApp Web API berbasis [Baileys](https://github.com/WhiskeySockets/Baileys), dengan tambahan layer socket ekstra yang dirancang untuk kebutuhan bot WA modern.

Library ini terhubung langsung ke WhatsApp Web lewat **WebSocket** — tanpa Selenium, tanpa browser, ringan dan cepat.

**Fitur tambahan dibanding Baileys standar:**

| Fitur | Keterangan |
|-------|-----------|
| `makePrivacySocket` | MEX GraphQL privacy settings |
| `makeUsernameSocket` | WA username (`@username`) |
| `makeAIGroupsSocket` | AI Groups (Meta AI di grup) |
| `makeInteropSocket` | Interoperability FB/IG |
| `makeGraphQLSocket` | HTTPS GraphQL (Meta AI, Events, Payments) |
| `makeManagedAccountSocket` | Managed accounts |
| `makeRegistrationSocket` | Registrasi & passkeys |
| `Baron` class | Album, Event, InteractiveButtons, Payment, Product, GroupStory, PollResult, Status |

> ⚠️ Tidak berafiliasi dengan WhatsApp. Gunakan dengan bijak sesuai ToS WhatsApp.

---

## ⚙️ Instalasi

```bash
npm install github:Nazril0/nanazxbaileys
# atau
yarn add github:Nazril0/nanazxbaileys
```

**Requirement:** Node.js ≥ 20

**Optional peer dependencies:**

| Package | Fungsi |
|---------|--------|
| `sharp` | Image processing / thumbnail otomatis |
| `jimp` | Fallback image processing |
| `audio-decode` | Metadata voice note |
| `link-preview-js` | Generate link preview |

```bash
npm install sharp jimp link-preview-js audio-decode
```

---

## 🚀 Quick Start

### Connect via QR Code

```js
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@nanazx/baileys'
import { Boom } from '@hapi/boom'

async function connect() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth')

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    markOnlineOnConnect: false
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const shouldReconnect =
        new Boom(lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) connect()
    } else if (connection === 'open') {
      console.log('✅ Terhubung!')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    const msg = messages[0]
    if (!msg.message) return
    const jid = msg.key.remoteJid
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || ''
    if (text === 'ping') await sock.sendMessage(jid, { text: 'pong 🏓' }, { quoted: msg })
  })
}

connect()
```

### Connect via Pairing Code

```js
const sock = makeWASocket({ auth: state, printQRInTerminal: false })

if (!state.creds.registered) {
  const code = await sock.requestPairingCode('628xxxxxxxxx') // nomor tanpa +
  console.log('Pairing code:', code)
}
```

### Receive Full History

```js
const sock = makeWASocket({
  auth: state,
  syncFullHistory: true
})
```

---

## ⚙️ Socket Config

```js
const sock = makeWASocket({
  auth: state,

  // Cache metadata grup agar tidak sering query ke WA server (recommended)
  cachedGroupMetadata: async (jid) => groupCache.get(jid),

  // Untuk retry pesan & decrypt poll votes — perlu store
  getMessage: async (key) => store.getMsg(key),

  // Supaya notif HP tidak terganggu saat bot aktif
  markOnlineOnConnect: false,

  // Link preview resolusi tinggi
  generateHighQualityLinkPreview: true
})
```

---

## 💾 Simpan Session

```js
import { useMultiFileAuthState } from '@nanazx/baileys'

const { state, saveCreds } = await useMultiFileAuthState('./auth')
sock.ev.on('creds.update', saveCreds)
// session tersimpan di folder ./auth — jangan di-share!
```

---

## 📅 Handling Events

```js
// ─── Pesan ───────────────────────────────────────────────────────
sock.ev.on('messages.upsert', ({ messages, type }) => {})     // pesan masuk/baru
sock.ev.on('messages.update', updates => {})                   // update status pesan
sock.ev.on('messages.delete', ({ keys }) => {})               // pesan dihapus
sock.ev.on('messages.reaction', reactions => {})              // reaksi pada pesan
sock.ev.on('messages.media-update', updates => {})            // update media key
sock.ev.on('message.comment', ({ message, comment }) => {})   // komentar pesan
sock.ev.on('message.quarantined', ({ message }) => {})        // pesan dikarantina
sock.ev.on('poll.add-option', ({ key }) => {})                // opsi poll ditambah

// ─── Chat & Kontak ────────────────────────────────────────────────
sock.ev.on('chats.upsert', chats => {})
sock.ev.on('chats.update', chats => {})
sock.ev.on('chats.delete', ids => {})
sock.ev.on('chats.lock', ({ id, locked }) => {})
sock.ev.on('contacts.upsert', contacts => {})
sock.ev.on('contacts.update', contacts => {})
sock.ev.on('blocklist.update', ({ blocklist, type }) => {})

// ─── Grup ────────────────────────────────────────────────────────
sock.ev.on('groups.upsert', groups => {})
sock.ev.on('groups.update', updates => {})
sock.ev.on('group-participants.update', ({ id, participants, action }) => {})
sock.ev.on('group.join-request', ({ id, participant, action }) => {})
sock.ev.on('group.member-tag.update', ({ id, participant }) => {})

// ─── Newsletter ───────────────────────────────────────────────────
sock.ev.on('newsletter-settings.update', update => {})
sock.ev.on('newsletter-participants.update', update => {})
sock.ev.on('newsletter.reaction', update => {})
sock.ev.on('newsletter.view', update => {})
sock.ev.on('newsletter.live-update', update => {})
sock.ev.on('newsletter.pin', update => {})
sock.ev.on('newsletter.invite', update => {})

// ─── Koneksi & Auth ──────────────────────────────────────────────
sock.ev.on('connection.update', ({ connection, qr, lastDisconnect, isOnline }) => {})
sock.ev.on('creds.update', saveCreds)
sock.ev.on('security.alert', data => {})
sock.ev.on('identity.update', ({ jid }) => {})
sock.ev.on('server.config', config => {})

// ─── Panggilan ────────────────────────────────────────────────────
sock.ev.on('call', calls => {})
sock.ev.on('call.scheduled', ({ call }) => {})
sock.ev.on('call.schedule-cancelled', ({ call }) => {})
sock.ev.on('coexistence.update', u => {})

// ─── Presence & Label ────────────────────────────────────────────
sock.ev.on('presence.update', ({ id, presences }) => {})
sock.ev.on('devices.update', ({ id, devices, isSelf }) => {})
sock.ev.on('labels.edit', ({ label }) => {})
sock.ev.on('labels.association', ({ association, type }) => {})
sock.ev.on('labels.reorder', ({ labelIds }) => {})

// ─── Sinkronisasi & Settings ─────────────────────────────────────
sock.ev.on('messaging-history.set', ({ chats, contacts, messages, isLatest }) => {})
sock.ev.on('messaging-history.status', ({ progress, hasMore }) => {})
sock.ev.on('settings.update', ({ setting, value }) => {})
sock.ev.on('lid-mapping.update', ({ lid, pn }) => {})
sock.ev.on('status.psa', ({ message }) => {})
sock.ev.on('status.mention', ({ message }) => {})
sock.ev.on('payment.split', ({ message }) => {})
sock.ev.on('payment.reminder', ({ message }) => {})
sock.ev.on('reminder.update', ({ message }) => {})
sock.ev.on('media.notify', ({ message }) => {})
sock.ev.on('cloud.thread.control', ({ message }) => {})
sock.ev.on('galaxy.flow.completed', ({ message }) => {})

// ─── Bot / Meta AI ────────────────────────────────────────────────
sock.ev.on('bot.feedback', ({ message }) => {})
sock.ev.on('bot.stop-generation', ({ message }) => {})
sock.ev.on('bot.welcome-request', ({ message }) => {})
```

---

## 💬 Sending Messages

### Teks & Dasar

```js
await sock.sendMessage(jid, { text: 'Halo!' })
```

### Quote / Reply

```js
await sock.sendMessage(jid, { text: 'Ini balasan' }, { quoted: msg })
```

### Mention

```js
await sock.sendMessage(jid, {
  text: '@628xxx halo!',
  mentions: ['628xxx@s.whatsapp.net']
})

// Mention semua (@everyone)
await sock.sendMessage(jid, {
  text: '@everyone',
  mentionAll: true
})
```

### Forward

```js
await sock.sendMessage(jid, { forward: msg })

// Force forward (tambah tanda forward)
await sock.sendMessage(jid, { forward: msg, force: true })
```

### Lokasi

```js
await sock.sendMessage(jid, {
  location: {
    degreesLatitude: -6.200000,
    degreesLongitude: 106.816666,
    name: 'Jakarta',      // opsional
    address: 'Indonesia'  // opsional
  }
})
```

### Live Location

```js
await sock.sendMessage(jid, {
  liveLocation: {
    degreesLatitude: -6.200000,
    degreesLongitude: 106.816666
  },
  accuracyInMeters: 10,
  speedInMps: 0,
  degreesClockwisefromMagneticNorth: 0,
  caption: 'Lokasi saya',
  sequenceNumber: 1
})
```

### Kontak

```js
const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:Nama Kontak\nTEL;type=CELL;waid=628xxx:+62 8xx xxxx xxxx\nEND:VCARD`

// Satu kontak
await sock.sendMessage(jid, {
  contacts: {
    displayName: 'Nama',
    contacts: [{ vcard }]
  }
})

// Banyak kontak sekaligus
await sock.sendMessage(jid, {
  contacts: {
    displayName: '2 Kontak',
    contacts: [{ vcard }, { vcard: vcard2 }]
  }
})
```

### Reaksi

```js
// Tambah reaksi
await sock.sendMessage(jid, { react: { text: '🔥', key: msg.key } })

// Hapus reaksi
await sock.sendMessage(jid, { react: { text: '', key: msg.key } })
```

### Pin Pesan

```js
// Pin pesan (type: 1 = pin, 0 = unpin)
// time: 86400 = 24 jam | 604800 = 7 hari | 2592000 = 30 hari
await sock.sendMessage(jid, {
  pin: msg.key,
  type: 1,
  time: 86400
})

// Unpin
await sock.sendMessage(jid, { pin: msg.key, type: 0, time: 0 })
```

### Poll

```js
// Poll pilih satu
await sock.sendMessage(jid, {
  poll: {
    name: 'Pilih satu!',
    values: ['Opsi A', 'Opsi B', 'Opsi C'],
    selectableCount: 1
  }
})

// Poll pilih banyak
await sock.sendMessage(jid, {
  poll: {
    name: 'Pilih bebas!',
    values: ['A', 'B', 'C'],
    selectableCount: 0 // 0 = bebas pilih semua
  }
})

// Poll di community announcement group (v2)
await sock.sendMessage(jid, {
  poll: {
    name: 'Voting komunitas',
    values: ['Ya', 'Tidak'],
    selectableCount: 1,
    toAnnouncementGroup: true
  }
})
```

### Hapus Pesan

```js
// Hapus for everyone
await sock.sendMessage(jid, { delete: msg.key })

// Hapus pesan orang lain di grup (admin)
await sock.sendMessage(groupJid, { delete: otherPersonMsg.key })
```

### Edit Pesan

```js
await sock.sendMessage(jid, {
  edit: msg.key,
  text: 'Teks yang sudah diedit'
})
```

### Pesan Menghilang

```js
// Aktifkan di chat / grup
// 86400 = 24h | 604800 = 7d | 7776000 = 90d | false / 0 = off
await sock.sendMessage(jid, { disappearingMessagesInChat: 86400 })
await sock.sendMessage(jid, { disappearingMessagesInChat: false })

// Kirim pesan sebagai ephemeral
await sock.sendMessage(jid, { text: 'pesan ini menghilang' }, { ephemeralExpiration: 86400 })
```

### Group Invite

```js
await sock.sendMessage(jid, {
  groupInvite: {
    jid: 'groupjid@g.us',
    subject: 'Nama Grup',
    inviteCode: 'xxxxxxxx',
    inviteExpiration: Date.now() + 86400000,
    text: 'Gabung yuk!'
  }
})
```

### Event / Jadwal

```js
await sock.sendMessage(jid, {
  event: {
    name: 'Nama Event',
    description: 'Deskripsi event',
    startDate: new Date('2025-01-01T10:00:00'),
    endDate: new Date('2025-01-01T12:00:00'),
    location: {
      degreesLatitude: -6.2,
      degreesLongitude: 106.8,
      name: 'Jakarta'
    },
    extraGuestsAllowed: true,
    isCancelled: false
  }
})
```

### Share / Request Phone Number

```js
// Bagikan nomor HP kamu ke lawan chat
await sock.sendMessage(jid, { sharePhoneNumber: true })

// Minta nomor HP dari lawan chat
await sock.sendMessage(jid, { requestPhoneNumber: true })
```

### Gambar

```js
// Dari URL
await sock.sendMessage(jid, { image: { url: './img.jpg' }, caption: 'Caption' })

// Dari Buffer
import { readFileSync } from 'fs'
await sock.sendMessage(jid, { image: readFileSync('./img.jpg'), caption: 'Caption' })

// Dengan mention di caption
await sock.sendMessage(jid, {
  image: { url: './img.jpg' },
  caption: 'Halo @628xxx',
  mentions: ['628xxx@s.whatsapp.net']
})
```

### Video

```js
await sock.sendMessage(jid, { video: { url: './video.mp4' }, caption: 'Video' })
```

### Audio

```js
await sock.sendMessage(jid, {
  audio: { url: './audio.mp3' },
  mimetype: 'audio/mp4'
})
```

### Voice Note (PTT)

```js
// PTT = Push To Talk (pesan suara, buble bundar)
await sock.sendMessage(jid, {
  audio: { url: './audio.ogg' },
  mimetype: 'audio/ogg; codecs=opus',
  ptt: true
})
```

### GIF

> WA tidak support `.gif` asli — kirim sebagai video mp4 dengan flag `gifPlayback`

```js
await sock.sendMessage(jid, {
  video: { url: './animasi.mp4' },
  gifPlayback: true,
  caption: 'GIF lucu'
})
```

### Video Note (PTV)

```js
// Video note = video bulat seperti voice note
await sock.sendMessage(jid, {
  video: { url: './clip.mp4' },
  ptv: true
})
```

### Dokumen

```js
await sock.sendMessage(jid, {
  document: { url: './file.pdf' },
  mimetype: 'application/pdf',
  fileName: 'dokumen.pdf',
  caption: 'Ini file PDF'
})
```

### Stiker

```js
await sock.sendMessage(jid, { sticker: { url: './sticker.webp' } })
```

### View Once

```js
// Gambar/video hanya bisa dilihat sekali
await sock.sendMessage(jid, {
  image: { url: './rahasia.jpg' },
  viewOnce: true
})

// View once video
await sock.sendMessage(jid, {
  video: { url: './rahasia.mp4' },
  viewOnce: true
})
```

### Album

> Kirim banyak foto/video sekaligus sebagai album (Baron feature)

```js
// album berisi array gambar/video
await sock.sendMessage(jid, {
  albumMessage: [
    { image: { url: './foto1.jpg' }, caption: 'Foto 1' },
    { image: { url: './foto2.jpg' }, caption: 'Foto 2' },
    { video: { url: './video.mp4' }, caption: 'Video' }
  ]
})

// Alias singkat
await sock.sendMessage(jid, {
  album: [
    { image: { url: './1.jpg' } },
    { image: { url: './2.jpg' } }
  ]
})
```

### Status / Stories

```js
// Status teks
await sock.sendMessage('status@broadcast', {
  text: 'Status saya hari ini 🔥',
  backgroundColor: '#000000',
  font: 2,
  statusJidList: ['628xxx@s.whatsapp.net'] // daftar orang yang lihat
})

// Status gambar
await sock.sendMessage('status@broadcast', {
  image: { url: './cover.jpg' },
  caption: 'Caption status',
  statusJidList: ['628xxx@s.whatsapp.net']
})

// Status video
await sock.sendMessage('status@broadcast', {
  video: { url: './story.mp4' },
  caption: 'Video status',
  statusJidList: ['628xxx@s.whatsapp.net']
})

// Pakai Baron — sendStatusWhatsApp (otomatis handle statusJidList dari grup/personal)
// Kirim status ke semua anggota grup tertentu sekaligus:
await baron.sendStatusWhatsApp(
  { text: 'Status ke grup', backgroundColor: '#1a1a2e' },
  ['groupjid@g.us', '628xxx@s.whatsapp.net']
)
```

### Status dengan Mention

```js
await sock.sendMessage('status@broadcast', {
  text: 'Halo @628xxx 👋',
  mentions: ['628xxx@s.whatsapp.net'],
  statusMentionedJids: ['628xxx@s.whatsapp.net']
})
```

### Group Story

> Kirim story/status ke grup (Baron feature)

```js
await sock.sendMessage(groupJid, {
  groupStatusMessage: {
    text: 'Story grup kita',
    backgroundColor: '#ff6b6b'
  }
})

// Atau dengan media
await sock.sendMessage(groupJid, {
  groupStatusMessage: {
    image: { url: './foto.jpg' },
    caption: 'Story grup!'
  }
})
```

### Link Preview

```js
// Link preview otomatis jika ada link-preview-js terinstall
await sock.sendMessage(jid, {
  text: 'Cek ini: https://github.com/Nazril0/nanazxbaileys'
})

// Nonaktifkan link preview
await sock.sendMessage(jid, {
  text: 'https://example.com',
  linkPreview: null
})
```

---

## 🎛️ Buttons & Interactive

### Reply Buttons

```js
await sock.sendMessage(jid, {
  buttonsMessage: {
    text: 'Pilih salah satu:',
    footer: 'Footer teks',
    buttons: [
      { buttonId: 'id1', buttonText: { displayText: 'Tombol 1' }, type: 1 },
      { buttonId: 'id2', buttonText: { displayText: 'Tombol 2' }, type: 1 },
      { buttonId: 'id3', buttonText: { displayText: 'Tombol 3' }, type: 1 }
    ],
    headerType: 1
  }
})
```

### List Message

```js
await sock.sendMessage(jid, {
  listMessage: {
    title: 'Menu Bot',
    description: 'Pilih fitur yang kamu mau',
    buttonText: 'Buka Menu',
    listType: 1,
    sections: [
      {
        title: 'Kategori 1',
        rows: [
          { title: 'Fitur A', description: 'Deskripsi A', rowId: 'fitur_a' },
          { title: 'Fitur B', description: 'Deskripsi B', rowId: 'fitur_b' }
        ]
      },
      {
        title: 'Kategori 2',
        rows: [
          { title: 'Fitur C', description: 'Deskripsi C', rowId: 'fitur_c' }
        ]
      }
    ]
  }
})
```

### Template Buttons

```js
await sock.sendMessage(jid, {
  templateMessage: {
    hydratedTemplate: {
      hydratedContentText: 'Halo! Ada yang bisa dibantu?',
      hydratedFooterText: 'Footer',
      hydratedButtons: [
        { quickReplyButton: { displayText: 'Ya', id: 'ya' } },
        { quickReplyButton: { displayText: 'Tidak', id: 'tidak' } },
        { urlButton: { displayText: 'Kunjungi Web', url: 'https://github.com/Nazril0' } },
        { callButton: { displayText: 'Hubungi', phoneNumber: '+628xxx' } }
      ]
    }
  }
})
```

### Interactive Message (nativeFlow)

```js
// Tombol quick reply
await sock.sendMessage(jid, {
  interactiveMessage: {
    body: { text: 'Pilih aksi:' },
    footer: { text: 'Footer teks' },
    nativeFlowMessage: {
      buttons: [
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({ display_text: 'Balas', id: 'balas' })
        },
        {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: 'Kunjungi',
            url: 'https://github.com/Nazril0',
            merchant_url: 'https://github.com/Nazril0'
          })
        },
        {
          name: 'cta_call',
          buttonParamsJson: JSON.stringify({ display_text: 'Telepon', phone_number: '+628xxx' })
        },
        {
          name: 'cta_copy',
          buttonParamsJson: JSON.stringify({
            display_text: 'Salin Kode',
            copy_code: 'NAZX2025'
          })
        }
      ]
    }
  }
})

// Dengan gambar di header
await sock.sendMessage(jid, {
  interactiveMessage: {
    image: { url: './thumb.jpg' },
    title: 'Header',
    body: { text: 'Deskripsi' },
    footer: { text: 'Footer' },
    nativeFlowMessage: {
      buttons: [
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Ok', id: 'ok' }) }
      ]
    }
  }
})
```

### Interactive Buttons (Baron)

> Wrapper Baron untuk interactiveMessage — support media di header

```js
await sock.sendMessage(jid, {
  interactiveButtons: [
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Ya', id: 'ya' }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Tidak', id: 'tidak' }) }
  ],
  text: 'Pilih jawaban:',
  footer: 'Footer teks',
  title: 'Header Judul',
  image: { url: './thumb.jpg' } // opsional: image/video/document
})

// Dengan externalAdReply (iklan/preview eksternal)
await sock.sendMessage(jid, {
  interactiveButtons: [
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Cek', id: 'cek' }) }
  ],
  text: 'Lihat penawaran ini!',
  externalAdReply: {
    title: 'Judul Iklan',
    body: 'Deskripsi iklan',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    sourceUrl: 'https://example.com',
    mediaType: 1,
    renderLargerThumbnail: true,
    showAdAttribution: true
  }
})
```

### Payment Request

```js
await sock.sendMessage(jid, {
  requestPaymentMessage: {
    amount: 50000,         // dalam satuan 1/1000 (50000 = Rp 50)
    currency: 'IDR',
    from: '628xxx@s.whatsapp.net',
    expiry: Date.now() + 86400000,
    note: 'Pembayaran untuk ...'  // atau sticker
  }
})
```

### Product Message

```js
await sock.sendMessage(jid, {
  productMessage: {
    title: 'Nama Produk',
    description: 'Deskripsi produk',
    thumbnail: { url: './produk.jpg' }, // atau Buffer
    productId: 'PROD123',
    retailerId: 'SKU-001',
    url: 'https://toko.com/produk',
    priceAmount1000: 50000000, // Rp 50.000 (dalam 1/1000)
    currencyCode: 'IDR',
    body: 'Teks body pesan',
    footer: 'Teks footer',
    buttons: [
      { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Pesan', id: 'pesan' }) }
    ]
  }
})
```

### Poll Result

```js
// Kirim hasil poll (snapshot)
await sock.sendMessage(jid, {
  pollResultMessage: {
    name: 'Nama Poll',
    pollVotes: [
      { optionName: 'Opsi A', optionVoteCount: 10 },
      { optionName: 'Opsi B', optionVoteCount: 5 }
    ]
  }
})
```

### Button Reply

```js
// Balas template button
await sock.sendMessage(jid, {
  buttonReply: { displayText: 'Ya', id: 'ya', index: 0 },
  type: 'template'
})

// Balas plain button
await sock.sendMessage(jid, {
  buttonReply: { displayText: 'Ya', id: 'ya' },
  type: 'plain'
})
```

### List Reply

```js
await sock.sendMessage(jid, {
  listReply: {
    singleSelectReply: { selectedRowId: 'fitur_a' },
    title: 'Fitur A',
    description: 'Kamu pilih Fitur A'
  }
})
```

---

## 📡 relayMessage

> `relayMessage` adalah fungsi low-level untuk mengirim pesan langsung (tanpa generate ulang). Digunakan untuk kasus custom.

```js
// Relay pesan biasa
await sock.relayMessage(jid, fullMsg.message, {
  messageId: fullMsg.key.id
})

// Relay ke status (stories)
await sock.relayMessage('status@broadcast', msg.message, {
  messageId: msg.key.id,
  statusJidList: ['628xxx@s.whatsapp.net', '628yyy@s.whatsapp.net']
})

// Relay ke newsletter
await sock.relayMessage('xxxxxxxxxxx@newsletter', msg.message, {
  messageId: msg.key.id
})

// Relay dengan participant tertentu (di grup)
await sock.relayMessage(groupJid, msg.message, {
  messageId: msg.key.id,
  participant: '628xxx@s.whatsapp.net'
})

// Relay dengan attribute tambahan (mis. untuk delete/edit)
await sock.relayMessage(jid, msg.message, {
  messageId: msg.key.id,
  additionalAttributes: { edit: '7' } // 7=hapus sendiri, 8=hapus admin grup, 1=edit, 2=pin
})
```

---

## 📥 Download Media

```js
import { downloadMediaMessage, getContentType } from '@nanazx/baileys'

sock.ev.on('messages.upsert', async ({ messages }) => {
  const msg = messages[0]
  if (!msg.message) return

  const type = getContentType(msg.message)
  // 'imageMessage' | 'videoMessage' | 'audioMessage' | 'documentMessage' | 'stickerMessage' | ...

  if (type === 'imageMessage') {
    // Download sebagai buffer
    const buffer = await downloadMediaMessage(msg, 'buffer', {})
    require('fs').writeFileSync('./hasil.jpg', buffer)

    // Atau sebagai stream
    const stream = await downloadMediaMessage(msg, 'stream', {})
    stream.pipe(require('fs').createWriteStream('./hasil.jpg'))
  }
})
```

---

## 🔄 Re-upload Media

```js
// WA kadang hapus media lama — re-upload dari device lain
await sock.updateMediaMessage(msg)
```

---

## 📖 Read Messages

```js
// Tandai pesan sudah dibaca (satu atau banyak sekaligus)
await sock.readMessages([msg.key])
await sock.readMessages([msg1.key, msg2.key, msg3.key])
```

---

## 👁️ Presence

```js
// Pantau presence orang lain (typing, online)
await sock.presenceSubscribe(jid)
sock.ev.on('presence.update', ({ id, presences }) => {
  console.log(id, presences)
  // presences = { '628xxx@s.whatsapp.net': { lastKnownPresence: 'composing' } }
})

// Update presence kamu sendiri
// 'available' | 'unavailable' | 'composing' | 'recording' | 'paused'
await sock.sendPresenceUpdate('composing', jid) // tampil "mengetik..."
await sock.sendPresenceUpdate('recording', jid) // tampil "merekam..."
await sock.sendPresenceUpdate('available')      // online
await sock.sendPresenceUpdate('unavailable')    // offline
```

---

## 👥 Groups

```js
// Buat grup
const group = await sock.groupCreate('Nama Grup', ['628xxx@s.whatsapp.net'])
console.log('ID Grup:', group.gid)

// Add / Kick / Promote / Demote
await sock.groupParticipantsUpdate(jid, ['628xxx@s.whatsapp.net'], 'add')
// action: 'add' | 'remove' | 'promote' | 'demote'

// Ganti nama grup
await sock.groupUpdateSubject(jid, 'Nama Baru')

// Ganti deskripsi
await sock.groupUpdateDescription(jid, 'Deskripsi baru')

// Ubah setting
await sock.groupSettingUpdate(jid, 'announcement')     // hanya admin yang bisa kirim
await sock.groupSettingUpdate(jid, 'not_announcement') // semua bisa kirim
await sock.groupSettingUpdate(jid, 'locked')           // hanya admin yang ubah info
await sock.groupSettingUpdate(jid, 'unlocked')         // semua bisa ubah info

// Keluar dari grup
await sock.groupLeave(jid)

// Invite link
const code = await sock.groupInviteCode(jid)
console.log('https://chat.whatsapp.com/' + code)
await sock.groupRevokeInvite(jid)        // reset link
await sock.groupAcceptInvite('kode')     // join via kode
const info = await sock.groupGetInviteInfo('kode') // info grup via kode

// Metadata grup
const meta = await sock.groupMetadata(jid)
console.log(meta.subject, meta.participants)

// Semua grup yang diikuti
const all = await sock.groupFetchAllParticipating()

// Join request (grup dengan approval)
const requests = await sock.groupRequestParticipantsList(jid)
await sock.groupRequestParticipantsUpdate(jid, ['628xxx@s.whatsapp.net'], 'approve')
// action: 'approve' | 'reject'

// Pesan menghilang (0 = off)
await sock.groupToggleEphemeral(jid, 86400)

// Mode tambah anggota
await sock.groupMemberAddMode(jid, 'all_member_add') // atau 'admin_add'

// Join approval mode
await sock.groupJoinApprovalMode(jid, 'on') // 'on' | 'off'

// Acknowledge grup (tandai grup sudah dibaca)
await sock.groupAcknowledge(jid)
```

---

## 📡 Newsletter (Channel)

```js
// Buat channel
await sock.newsletterCreate('Nama Channel', 'Deskripsi')

// Metadata channel
const meta = await sock.newsletterMetadata('invite', 'kode_atau_jid')

// Update channel
await sock.newsletterUpdateName(jid, 'Nama Baru')
await sock.newsletterUpdateDescription(jid, 'Deskripsi baru')
await sock.newsletterUpdatePicture(jid, { url: './foto.jpg' })
await sock.newsletterRemovePicture(jid)

// Ambil pesan channel
const msgs = await sock.newsletterFetchMessages(jid, 10)

// Reaksi pada pesan channel
await sock.newsletterReactMessage(jid, serverId, '🔥')

// Subscribe update channel (realtime)
await sock.subscribeNewsletterUpdates(jid)

// Info admin & ganti owner
const count = await sock.newsletterAdminCount(jid)
await sock.newsletterChangeOwner(jid, newOwnerJid)
await sock.newsletterDemote(jid, userJid)

// Daftar subscribers
const subs = await sock.newsletterSubscribers(jid)

// Hapus channel
await sock.newsletterDelete(jid)
```

---

## 🌐 Community

```js
// Buat community
const community = await sock.communityCreate('Nama Community', 'Deskripsi')

// Buat grup di dalam community
await sock.communityCreateGroup('Nama Grup', ['628xxx@s.whatsapp.net'], communityJid)

// Link / unlink grup ke community
await sock.communityLinkGroup(groupJid, communityJid)
await sock.communityUnlinkGroup(groupJid, communityJid)

// Ambil semua linked groups
const linked = await sock.communityFetchLinkedGroups(communityJid)

// Update community
await sock.communityUpdateSubject(communityJid, 'Nama Baru')
await sock.communityUpdateDescription(communityJid, 'Deskripsi')

// Invite link
const code = await sock.communityInviteCode(communityJid)
await sock.communityRevokeInvite(communityJid)
await sock.communityAcceptInvite('kode')

// Kelola anggota
await sock.communityParticipantsUpdate(communityJid, ['628xxx@s.whatsapp.net'], 'add')
// action: 'add' | 'remove' | 'promote' | 'demote'

// Join request
const reqs = await sock.communityRequestParticipantsList(communityJid)
await sock.communityRequestParticipantsUpdate(communityJid, ['628xxx@s.whatsapp.net'], 'approve')

// Keluar dari community
await sock.communityLeave(communityJid)
```

---

## 🤖 AI Groups

```js
// Buat AI Group
const aiGroup = await sock.aiGroupCreate('Nama AI Group', ['628xxx@s.whatsapp.net'])

// Tambah bot ke AI group (default: Meta AI)
await sock.aiGroupAddBot(jid)
await sock.aiGroupAddBot(jid, '867051314767696') // explicit bot ID

// Update subjek
await sock.aiGroupUpdateSubject(jid, 'Subjek Baru')

// Get invite code & join
const code = await sock.aiGroupInviteCode(jid)
await sock.aiGroupAcceptInvite('kode')
await sock.aiGroupRevokeInvite(jid)

// Kelola anggota
await sock.aiGroupParticipantsUpdate(jid, ['628xxx@s.whatsapp.net'], 'add')

// Setting & ephemeral
await sock.aiGroupSettingUpdate(jid, 'announcement')
await sock.aiGroupToggleEphemeral(jid, 86400)

// Keluar
await sock.aiGroupLeave(jid)
```

---

## 🔗 Username WA

```js
// Cek ketersediaan username
const result = await sock.checkUsername('nazxtampan')
// { available: true, username: 'nazxtampan' }

// Set username
await sock.setUsername('nazxtampan')

// Get username kamu
const me = await sock.getMyUsername()

// Cari user berdasarkan username
const user = await sock.findUserByUsername('nazxtampan')
// { jid: '628xxx@s.whatsapp.net', contact: false } atau null

// Ambil username dari daftar JID
const usernames = await sock.fetchContactUsernames('628xxx@s.whatsapp.net')

// Cek banyak username sekaligus
const results = await sock.checkUsernameMulti(['nazx', 'nazxtampan', 'nazxbot'])

// Rekomendasi username
const recs = await sock.getUsernameRecommendations()

// Set PIN username
await sock.setUsernamePin('123456')

// Hapus username
await sock.deleteUsername()
```

---

## 🔒 Privacy

```js
// Blokir / Unblokir
await sock.updateBlockStatus(jid, 'block')
await sock.updateBlockStatus(jid, 'unblock')

// Ambil privacy settings
const privacy = await sock.fetchPrivacySettings()
const freshPrivacy = await sock.fetchPrivacySettings(true) // force refresh

// Ambil blocklist
const blocklist = await sock.fetchBlocklist()

// Update privacy (IQ-based)
await sock.updateLastSeenPrivacy('contacts')       // 'all' | 'contacts' | 'contact_blacklist' | 'none'
await sock.updateOnlinePrivacy('all')              // 'all' | 'match_last_seen'
await sock.updateProfilePicturePrivacy('contacts') // 'all' | 'contacts' | 'contact_blacklist' | 'none'
await sock.updateStatusPrivacy('contacts')
await sock.updateReadReceiptsPrivacy('all')        // 'all' | 'none'
await sock.updateGroupsAddPrivacy('contacts')      // 'all' | 'contacts' | 'contact_blacklist'
await sock.updateCallPrivacy('all')
await sock.updateDefaultDisappearingMode(86400)    // 0 = off

// Set via MEX GraphQL (lowercase feature & setting)
await sock.setPrivacySetting('last', 'contacts')
await sock.setPrivacySetting('online', 'all')
await sock.setPrivacySetting('profile', 'contacts')
await sock.setPrivacySetting('status', 'contacts')
await sock.setPrivacySetting('readreceipts', 'all')
await sock.setPrivacySetting('groupadd', 'contact_blacklist')
await sock.setPrivacySetting('calladd', 'contacts')
await sock.setPrivacySetting('defense', 'on_standard') // anti-scraping

// Kelola contact list untuk blacklist
await sock.updatePrivacyContactList('groupadd', 'contact_blacklist', [jid1, jid2])
const current = await sock.getPrivacyContactList('groupadd', 'contact_blacklist')

// Block pesan dari akun tidak dikenal
const status = await sock.getChatBlockingStatus() // 'blocked' | 'unblocked'
await sock.updateChatBlockingStatus('block')
```

---

## 👤 User & Profile

```js
// Cek apakah nomor terdaftar di WA
const [result] = await sock.onWhatsApp('628xxxxxxxxx')
console.log(result.exists, result.jid)

// Foto profil
const pp = await sock.profilePictureUrl(jid, 'preview') // resolusi rendah
const ppHD = await sock.profilePictureUrl(jid, 'image') // resolusi tinggi

// Status teks (legacy)
const status = await sock.fetchStatus(jid)

// About text via MEX
const abouts = await sock.getTextStatusList([jid])
// [{ jid, text: 'Hey there!', emoji: '👋', timestamp: 1234567890 }]

// Profil bisnis
const biz = await sock.getBusinessProfile(jid)

// Update profil
await sock.updateProfileName('Nama Baru')
await sock.updateProfileStatus('Bot aktif 24/7 🤖')
await sock.updateProfilePicture(jid, { url: './foto.jpg' })
await sock.removeProfilePicture(jid)

// History chat
await sock.fetchMessageHistory(50, oldestMsg.key, oldestMsg.messageTimestamp)

// Verifikasi JID sebelum buka chat
const integrity = await sock.contactIntegrityQuery([jid])
```

---

## 💬 Modifikasi Chat

```js
// Archive / Unarchive
await sock.chatModify({ archive: true, lastMessages: [msg] }, jid)
await sock.chatModify({ archive: false, lastMessages: [msg] }, jid)

// Mute (dalam ms) | null = unmute
await sock.chatModify({ mute: 8 * 60 * 60 * 1000 }, jid)   // mute 8 jam
await sock.chatModify({ mute: 7 * 24 * 60 * 60 * 1000 }, jid) // mute 7 hari
await sock.chatModify({ mute: null }, jid)                   // unmute

// Tandai belum/sudah dibaca
await sock.chatModify({ markRead: false, lastMessages: [msg] }, jid)
await sock.chatModify({ markRead: true, lastMessages: [msg] }, jid)

// Hapus pesan untuk saya saja
await sock.chatModify({
  clear: {
    messages: [{ id: msg.key.id, fromMe: msg.key.fromMe, timestamp: msg.messageTimestamp }]
  }
}, jid)

// Hapus seluruh chat
await sock.chatModify({ delete: true, lastMessages: [msg] }, jid)

// Pin / Unpin chat
await sock.chatModify({ pin: true }, jid)
await sock.chatModify({ pin: false }, jid)

// Bintangi / Hapus bintang pesan
await sock.chatModify({
  star: {
    messages: [{ id: msg.key.id, fromMe: msg.key.fromMe }],
    star: true  // false = hapus bintang
  }
}, jid)

// Pesan menghilang di chat
await sock.sendMessage(jid, { disappearingMessagesInChat: 86400 }) // aktifkan
await sock.sendMessage(jid, { disappearingMessagesInChat: false })  // nonaktifkan
```

---

## 📞 Panggilan

```js
// Tolak panggilan masuk
await sock.rejectCall(callId, callFrom)

// Buat call link
const token = await sock.createCallLink('audio') // 'audio' | 'video'

// Toggle waiting room di call link
await sock.toggleCallLinkWaitingRoom(token, true, 'audio')

// Event panggilan
sock.ev.on('call', (calls) => {
  for (const call of calls) {
    console.log('Panggilan dari:', call.from, 'status:', call.status)
    // Tolak otomatis
    if (call.status === 'offer') {
      sock.rejectCall(call.id, call.from)
    }
  }
})
```

---

## 🗳️ Decrypt Poll Votes

```js
import { getAggregateVotesInPollMessage } from '@nanazx/baileys'

sock.ev.on('messages.update', async (updates) => {
  for (const { key, update } of updates) {
    if (update.pollUpdates) {
      const pollCreation = await getMessage(key) // ambil dari store
      if (pollCreation) {
        const votes = getAggregateVotesInPollMessage({
          message: pollCreation,
          pollUpdates: update.pollUpdates
        })
        console.log('Hasil poll:', votes)
        // [{ name: 'Opsi A', voters: ['628xxx@s.whatsapp.net'] }, ...]
      }
    }
  }
})
```

---

## 🔧 Custom Functionality

```js
import P from 'pino'

// Enable debug logs
const sock = makeWASocket({ logger: P({ level: 'debug' }) })

// Raw WebSocket events
sock.ws.on('CB:message', node => console.log(node))

// Register callback untuk WA node tertentu
sock.ws.on('CB:edge_routing', node => {})
sock.ws.on('CB:ib,,dirty', node => {})
sock.ws.on('CB:iq,,result', node => {})

// Raw WebSocket callback dengan filter atribut
sock.ws.on('CB:edge_routing,id:abcd', node => {})
sock.ws.on('CB:edge_routing,id:abcd,routing_info', node => {})
```

---

## 📁 Struktur Library

```
@nanazx/baileys/
├── lib/
│   ├── Socket/
│   │   ├── socket.js              # core websocket
│   │   ├── messages-send.js       # sendMessage, relayMessage, readMessages
│   │   ├── messages-recv.js       # terima & decode pesan
│   │   ├── interactive-handler.js # Baron class (album, event, interactive, dll)
│   │   ├── chats.js               # chat modifier, presence, profile, user queries
│   │   ├── groups.js              # group management
│   │   ├── newsletter.js          # channel/newsletter WA
│   │   ├── communities.js         # community WA
│   │   ├── aigroups.js            # AI Groups ★ nanazx
│   │   ├── username.js            # WA username ★ nanazx
│   │   ├── privacy.js             # MEX privacy ★ nanazx
│   │   ├── interop.js             # FB/IG interop ★ nanazx
│   │   ├── graphql.js             # HTTPS GraphQL ★ nanazx
│   │   ├── managed-account.js     # managed account ★ nanazx
│   │   ├── registration.js        # registrasi & passkeys ★ nanazx
│   │   └── mex.js                 # MEX protocol core ★ nanazx
│   ├── Utils/
│   │   ├── messages.js            # generateWAMessage & semua content types
│   │   ├── messages-media.js      # upload, download, thumbnail media
│   │   ├── auth-utils.js          # auth state utilities
│   │   ├── crypto.js              # enkripsi/dekripsi
│   │   └── ...
│   ├── Types/                     # TypeScript type definitions
│   ├── Store/                     # in-memory store
│   └── Defaults/                  # konfigurasi default
└── WAProto/                       # protobuf WhatsApp
```

---

## 🙏 Credits

| Project | Link |
|---------|------|
| **Baileys** (by WhiskeySockets) | [github.com/WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys) |
| **baron-baileys-v2** (by 7ucg) | [github.com/7ucg/baron-baileys-v2](https://github.com/7ucg/baron-baileys-v2) |

Terima kasih besar kepada seluruh kontributor dan maintainer kedua proyek luar biasa tersebut 🫶

---

## 📱 Kontak

| Platform | Link |
|----------|------|
| 🐙 GitHub | [@Nazril0](https://github.com/Nazril0) |
| 📸 Instagram | [@nazzxx._0](https://instagram.com/nazzxx._0) |
| 🎵 TikTok | [@nazxtampan__](https://tiktok.com/@nazxtampan__) |

---

<div align="center">

Made with ❤️ by **nazx**

Built on top of [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys) & [7ucg/baron-baileys-v2](https://github.com/7ucg/baron-baileys-v2)

⚠️ Tidak berafiliasi dengan WhatsApp. Gunakan dengan tanggung jawab.

</div>
