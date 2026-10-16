# 🌃 NightLane

**A neon, Persona-style group chat for you and your friends.**

**[nightlane.chat](https://nightlane.chat)** · Works on iPhone, Android and PC · Ages 13+

NightLane is a chat app that feels like a game menu: tilted message bubbles, a big date stamp, glitchy neon and a city at night behind every chat. Make rooms with your crew, DM your friends, play games right in the chat, raise a pixel pet, and hunt down **187 hidden secrets** that turn your messages into scenes.

It installs straight from the browser like a real app (no app store needed), works offline, and sends notifications to your phone.

---

## ✨ What you can do

| | |
| --- | --- |
| 💬 **Chat** | Rooms and DMs, replies, edits, reactions with any emoji, mentions, pins, GIFs, photos, videos, voice notes, PDFs, spoiler photos, read receipts and typing indicators |
| 📞 **Calls** | Video and voice calls in DMs: flip camera, a privacy "glitch" mask, loud/quiet modes, a movable self-view |
| 🎮 **Games** | Tic-tac-toe, King's Court, Crazy Eights, Liar's Dice, Mancala, BS, Lucky 7, Mahjong and Go, played turn by turn in the chat |
| 🥚 **Partners** | A pixel pet that hatches and evolves as you chat (shinies exist) |
| 💫 **Social Bonds** | Friendship ranks and tarot Arcana that grow the more you talk |
| 🪪 **Profiles** | Banner and photo cropper, effects, stickers, frames, pronouns, relationship status, partner tags, mutual friends, social links |
| 🎬 **Media Backlog** | Track and share the games, shows, movies and books you're into |
| 🔍 **Secrets** | 187 hidden phrases with their own effects, plus secret themes and two full secret modes |
| 🔔 **Notifications** | Push on every platform, unread count on the app icon, quiet while you're already reading the chat |
| 🛡️ **Safety** | Reporting, blocking, private profiles and a 13+ age minimum |

---

## 🛠️ How it's built

NightLane is a single-page **Progressive Web App** with a **Supabase** backend.

| Part | Tech |
| --- | --- |
| Front end | One `index.html` (HTML, CSS and vanilla JavaScript, no framework) |
| Offline + push | Service worker (`sw.js`) with the Web Push API |
| Accounts | Supabase Auth |
| Database | PostgreSQL with Row Level Security, so people can only read the chats they're in |
| Game moves and actions | Postgres functions (RPCs), so rules are checked on the server |
| Live updates | Supabase Realtime (private channels) |
| Files | Supabase Storage |
| Notifications | Supabase Edge Function (`functions/notify`) |
| Calls | WebRTC, with Cloudflare TURN relays for tough networks |
| Hosting | GitHub Pages at [nightlane.chat](https://nightlane.chat) |

The app also has a built-in **demo mode** with pretend friends, used to test every change in a browser before it ships.

### Project layout

```
index.html        the whole app
sw.js             service worker (offline + notifications)
functions/notify  push notification edge function
*.sql             database changes, one file per feature
CNAME             custom domain (don't touch)
```

### Shipping an update

1. **SQL first:** run any new `.sql` file in the Supabase SQL Editor.
2. **Functions next:** redeploy any changed edge function.
3. **App last:** upload `index.html` (and `sw.js` if it changed).

Every update gets a new version number (`APP_VERSION`) and a note at the top of the in-app **What's new** list.

> **Security:** the Supabase *service role* key, Cloudflare TURN keys and app signing keys never go in this repo. Server secrets live only in Supabase's secret settings.

---

## 📈 By the numbers

- 180+ updates shipped since launch in September 2026
- 9 games, 22 profile frames, 9 secret themes, 187 secrets
- Used every day by a real group of friends on iPhone and Android

---

## 👤 Credits

**Created by [Cole Eggly](https://nightlane.chat)**: design, direction, testing with real users, and hand-coded features including the Welcome intro, Tips page, Credits screen, message reporting and the admin reports review, pinned chats, update screens, part of video calling, ink-map footprints, relationship status and mutual friends.

Built with AI pair-programming (Claude) for the rest.

Tarot Arcana art uses the public-domain Rider–Waite deck.

---

© 2026 Cole Eggly. All rights reserved.
