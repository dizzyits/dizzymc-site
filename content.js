/* ============================================================
   DIZZYITS.COM - EDIT THIS FILE TO UPDATE YOUR SITE
   Save it, upload it, done. No other file needs to change.
   ============================================================ */

const SITE = {
  name: "Dizzyits",
  tagline: "Live streams, videos and whatever else I'm up to. Everything lands here first.",

  // Your channel links (leave "" to hide a button)
  links: {
    discord: "https://discord.com/invite/nFR9J3K7vZ",
    youtube: "https://www.youtube.com/@DizzyIts",
    twitch:  "https://www.twitch.tv/dizzyits_",
    x:       "https://x.com/DizzyIts_",
    tiktok:  "",
  },

  // Twitch channel name for the live player ("" to hide it)
  twitchChannel: "dizzyits_",
};

/* Ads (Google AdSense). Leave both blank and no ads show.
   After AdSense approves you: client looks like "ca-pub-1234567890123456",
   slot is the number of a Display ad unit you create in AdSense.        */
const ADS = {
  client: "",
  slot: "",
};

/* Videos / posts. Newest first. Types: "youtube", "tiktok", "twitch-clip"
   - youtube: id = the part after v= in the URL (youtube.com/watch?v=THIS)
   - tiktok:  id = the number at the end of the URL (tiktok.com/@you/video/THIS)
   - twitch-clip: id = clip slug (clips.twitch.tv/THIS)                      */
const POSTS = [
  // The Videos section stays hidden until you add one. Copy a line, remove the // and fill it in:
  // { type: "youtube", id: "VIDEO_ID_HERE", title: "My latest video", date: "2026-11-07" },
  // { type: "tiktok",  id: "1234567890123456789", title: "My TikTok", date: "2026-11-05" },
];

/* News articles. Newest first. */
const NEWS = [
  {
    title: "The site is up",
    date: "2026-11-07",
    image: "", // optional image URL
    summary: "Finally got a proper home for everything. Streams, videos and news will all be posted here.",
    body: "Write the full article here. It shows when someone clicks 'Read more'. Use blank lines for paragraphs.\n\nSecond paragraph goes here.",
  },
];
