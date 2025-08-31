/* =========================================
   Config — edit here first
   ========================================= */
const CONFIG = {
  STREAMER: {
    displayName: "Sleepy",
    tagline: "Streamer • Content Creator",
    // If you add a profile image or banner, do it in CSS or by inserting an <img> in index.html
  },

  TWITCH: {
    channel: "sleepypigeon_",
    // parent is set dynamically from window.location.hostname for GitHub Pages, etc.
  },

  CLIPS: [
    // Replace these with your own embeddable URLs.
    // YouTube examples:
    {
      title: "Insane clutch (example)",
      url: "https://vm.tiktok.com/ZMAjEAuHs/"
    },
    {
      title: "Funny moment (example)",
      url: "https://www.youtube.com/watch?v=xNNlWBqaJxA&ab_channel=sleepypigeon"
    },
    {
      title: "Clean outplay (example)",
      url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ"
    }
    // Twitch clip support is included too — just supply a Twitch clip URL:
    // { title: "Twitch clip", url: "https://clips.twitch.tv/IncrediblePluckyVelociraptorHeyGuys" }
  ],

  SCHEDULE: {
    // One fixed time shown in visitor's local timezone.
    // Set your base time as UTC hour/minute:
    utcHour: 1,     // 01:00 UTC  -> change this for your real time
    utcMinute: 0,
    days: ["Mon", "Wed", "Fri"] // Edit as you like
  },

  SOCIALS_PRIMARY: [
    // Shown as hero buttons
    { label: "Twitch", url: "https://twitch.tv/sleepypigeon_", icon: "twitch" },
    { label: "TikTok", url: "https://www.tiktok.com/@iamsleepyosu", icon: "tiktok" }
  ],

  SOCIALS: [
    // Social Hub grid — add/remove freely. New items inherit style automatically.
    { label: "Twitch", url: "https://twitch.tv/sleepypigeon", icon: "twitch" },
    { label: "TikTok", url: "https://www.tiktok.com/@iamsleepyosu", icon: "tiktok" },
    { label: "YouTube", url: "https://youtube.com/@sleepypigeonfn", icon: "youtube" },
    { label: "Twitter/X", url: "https://twitter.com/sleepypigeon11", icon: "twitter" },
    { label: "Instagram", url: "https://instagram.com/iamsleepy24.7", icon: "instagram" },
    { label: "Discord", url: "https://discord.gg/yourinvite", icon: "discord" }
  ]
};

/* =========================================
   Theme (dark by default with toggle)
   ========================================= */
(function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light") {
    document.documentElement.classList.add("light");
  }
  const btn = document.getElementById("themeToggle");
  btn?.addEventListener("click", () => {
    document.documentElement.classList.toggle("light");
    const mode = document.documentElement.classList.contains("light") ? "light" : "dark";
    localStorage.setItem("theme", mode);
  });
})();

/* =========================================
   Header branding content
   ========================================= */
(function setBranding() {
  const nameEl = document.querySelector(".brand-name");
  const tagEl = document.querySelector(".brand-tagline");
  if (nameEl) nameEl.textContent = CONFIG.STREAMER.displayName || "Sleepy";
  if (tagEl) tagEl.textContent = CONFIG.STREAMER.tagline || "Streamer • Content Creator";
})();

/* =========================================
   Reveal on scroll (IntersectionObserver)
   ========================================= */
(function revealOnScroll() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach(el => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

/* =========================================
   Twitch embeds (player + chat), no API
   ========================================= */
(function mountTwitch() {
  const parent = location.hostname || "localhost";
  const channel = encodeURIComponent(CONFIG.TWITCH.channel);

  const player = document.getElementById("twitchPlayer");
  const chat = document.getElementById("twitchChat");
  if (player) {
    player.src = `https://player.twitch.tv/?channel=${channel}&parent=${parent}&muted=false`;
    player.setAttribute("allow", "fullscreen; autoplay; picture-in-picture");
  }
  if (chat) {
    chat.src = `https://www.twitch.tv/embed/${channel}/chat?parent=${parent}&darkpopout`;
  }
})();

/* =========================================
   Clips grid — supports YouTube + Twitch clips + generic iframes
   ========================================= */
(function renderClips() {
  const grid = document.getElementById("clipsGrid");
  if (!grid) return;

  CONFIG.CLIPS.forEach((clip, i) => {
    const card = document.createElement("article");
    card.className = "clip-card";

    const frame = document.createElement("iframe");
    frame.className = "frame";
    frame.loading = "lazy";
    frame.allowFullscreen = true;
    frame.referrerPolicy = "no-referrer-when-downgrade";
    frame.setAttribute("allow", "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");

    const src = toEmbedURL(clip.url);
    frame.src = src;

    const meta = document.createElement("div");
    meta.className = "meta";
    const title = document.createElement("span");
    title.className = "title";
    title.textContent = clip.title || `Clip ${i + 1}`;
    const source = document.createElement("span");
    source.className = "source";
    source.textContent = getHostLabel(clip.url);

    meta.appendChild(title);
    meta.appendChild(source);

    card.appendChild(frame);
    card.appendChild(meta);
    grid.appendChild(card);
  });
})();

function toEmbedURL(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");
    const parent = location.hostname || "localhost";

    // YouTube watch -> embed
    if (host.includes("youtube.com")) {
      const vid = u.searchParams.get("v");
      if (vid) return `https://www.youtube.com/embed/${vid}`;
      // Short link or /embed already:
      if (u.pathname.startsWith("/embed/")) return url;
    }
    // youtu.be short
    if (host === "youtu.be") {
      const vid = u.pathname.slice(1);
      if (vid) return `https://www.youtube.com/embed/${vid}`;
    }
    // Twitch clips
    if (host.includes("clips.twitch.tv")) {
      // clip URL like /{ClipSlug}
      const clipId = u.pathname.split("/").filter(Boolean)[0];
      if (clipId) return `https://clips.twitch.tv/embed?clip=${clipId}&parent=${parent}&autoplay=false`;
    }
    // Generic: return as-is (some platforms provide embeddable players directly)
    return url;
  } catch {
    return url;
  }
}

function getHostLabel(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace("www.", "");
  } catch {
    return "external";
  }
}

/* =========================================
   Schedule — convert UTC fixed time to visitor’s local time
   ========================================= */
(function renderSchedule() {
  const { utcHour, utcMinute, days } = CONFIG.SCHEDULE;

  const utcTimeEl = document.getElementById("utcTime");
  const localTimeEl = document.getElementById("localTime");
  const daysEl = document.getElementById("scheduleDays");

  if (daysEl) daysEl.textContent = days.join(" • ");

  // Build a Date at today's date with the fixed UTC time
  const now = new Date();
  const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), utcHour, utcMinute, 0));

  // Formatters
  const utcFmt = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC"
  });
  const localFmt = new Intl.DateTimeFormat(undefined, {
    weekday: undefined, hour: "2-digit", minute: "2-digit", hour12: true
  });

  if (utcTimeEl) utcTimeEl.textContent = utcFmt.format(utcDate) + " UTC";
  if (localTimeEl) localTimeEl.textContent = localFmt.format(utcDate) + " (your time)";
})();

/* =========================================
   Social Hub — dynamic grid from CONFIG.SOCIALS
   ========================================= */
(function renderSocialHub() {
  const hub = document.getElementById("socialHub");
  if (!hub) return;

  CONFIG.SOCIALS.forEach(item => {
    const a = document.createElement("a");
    a.className = "social-card";
    a.href = item.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.innerHTML = `${getIconSVG(item.icon)} <span class="label">${escapeHTML(item.label)}</span>`;
    hub.appendChild(a);
  });
})();

/* =========================================
   Footer year
   ========================================= */
document.getElementById("year").textContent = new Date().getFullYear();

/* =========================================
   Utilities: icons + escape
   ========================================= */
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, s => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[s]));
}

// Minimal inline SVG icons
function getIconSVG(name) {
  const icons = {
    twitch: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 3h16v11l-4 4h-4l-2 2H8v-2H4V3zm2 2v10h4v2h1.172L12.586 15H17l1-1V5H6zm8 2h2v5h-2V7zm-4 0h2v5H10V7z"/></svg>`,
    tiktok: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 3c.4 2.2 2 3.9 4.2 4.3v2.7c-1.1-.1-2.2-.4-3.2-.9v5.5c0 3-2.4 5.4-5.4 5.4S3.7 17.6 3.7 14.6c0-3 2.4-5.4 5.4-5.4.4 0 .7 0 1 .1V11c-.3-.1-.6-.1-1-.1-1.9 0-3.4 1.5-3.4 3.4s1.5 3.4 3.4 3.4 3.4-1.5 3.4-3.4V3h1.6z"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23 12c0-2.1-.2-3.5-.6-4.4-.3-.8-1-1.5-1.8-1.8C18.7 5.3 12 5.3 12 5.3s-6.7 0-8.6.5c-.8.3-1.5 1-1.8 1.8C1.2 8.5 1 9.9 1 12s.2 3.5.6 4.4c.3.8 1 1.5 1.8 1.8 1.9.5 8.6.5 8.6.5s6.7 0 8.6-.5c.8-.3 1.5-1 1.8-1.8.4-.9.6-2.3.6-4.4zM10 15.5v-7l6 3.5-6 3.5z"/></svg>`,
    twitter: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.7 7.2c.5-.3 1-.8 1.3-1.3-.5.2-1 .4-1.6.5.6-.4 1-1 1.2-1.7-.6.4-1.2.6-1.9.8a3.2 3.2 0 0 0-5.5 2.2c0 .3 0 .5.1.8-2.7-.1-5.2-1.4-6.8-3.5-.3.5-.4 1-.4 1.6 0 1.1.6 2 1.4 2.6-.5 0-1-.2-1.5-.4 0 1.6 1.1 3 2.6 3.3-.3.1-.6.1-.9.1-.2 0-.4 0-.6-.1.4 1.3 1.6 2.3 3 2.3a6.5 6.5 0 0 1-4 1.4H4a9 9 0 0 0 4.9 1.4c5.8 0 9-4.8 9-8.9v-.4c.6-.4 1.1-1 1.5-1.6z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zM18 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>`,
    discord: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 4a18 18 0 0 0-4.9-1.5l-.2.3c1.7.5 3.2 1.2 4.6 2.2a15 15 0 0 0-5.6-1.8 15 15 0 0 0-5.6 1.8c1.4-1 3-1.7 4.6-2.2l-.2-.3A18 18 0 0 0 4 4C1.5 7.6.7 11 1 14.3 3.6 16.2 6 17.4 8.4 18l.8-1.2c-1.6-.6-3-1.4-4.2-2.5.3.3.7.6 1 .8 3.6 2.5 8.5 2.5 12.1 0 .3-.2.7-.5 1-.8-1.2 1.1-2.7 2-4.2 2.5l.8 1.2c2.4-.7 4.8-1.8 7.4-3.7.4-3.3-.4-6.8-3-10.3zM8.7 12.4c0 .8-.6 1.4-1.4 1.4S6 13.2 6 12.4s.6-1.4 1.4-1.4 1.3.6 1.3 1.4zm8.1 0c0 .8-.6 1.4-1.4 1.4s-1.4-.6-1.4-1.4.6-1.4 1.4-1.4 1.4.6 1.4 1.4z"/></svg>`,
    globe: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm7.9 9h-3.1a14.8 14.8 0 0 0-2.2-6 8.02 8.02 0 0 1 5.3 6zM12 4c1.1 1.4 2.1 3.7 2.5 7H9.5C9.9 7.7 10.9 5.4 12 4zM4.2 15a8 8 0 0 1 0-6h3.1c-.2 1-.3 2-.3 3s.1 2 .3 3H4.2zm1.6 2h3.5c.4 2.3 1.4 4.5 2.7 6A8 8 0 0 1 5.8 17zm3.5-10H5.8A8 8 0 0 1 12 3c-1.3 1.5-2.3 3.7-2.7 6zm2.7 16c-1.3-1.5-2.3-3.7-2.7-6h5.4c-.4 2.3-1.4 4.5-2.7 6zM15.5 17H19a8 8 0 0 1-7 6c1.3-1.5 2.3-3.7 2.7-6zm.2-2c.2-1 .3-2 .3-3s-.1-2-.3-3H19a8 8 0 0 1 0 6h-3.3z"/></svg>`
  };
  return icons[name] || icons.globe;
}
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, s => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[s]));
}

// Minimal inline SVG icons
function getIconSVG(name) {
  const icons = {
    twitch: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 3h16v11l-4 4h-4l-2 2H8v-2H4V3zm2 2v10h4v2h1.172L12.586 15H17l1-1V5H6zm8 2h2v5h-2V7zm-4 0h2v5H10V7z"/></svg>`,
    tiktok: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 3c.4 2.2 2 3.9 4.2 4.3v2.7c-1.1-.1-2.2-.4-3.2-.9v5.5c0 3-2.4 5.4-5.4 5.4S3.7 17.6 3.7 14.6c0-3 2.4-5.4 5.4-5.4.4 0 .7 0 1 .1V11c-.3-.1-.6-.1-1-.1-1.9 0-3.4 1.5-3.4 3.4s1.5 3.4 3.4 3.4 3.4-1.5 3.4-3.4V3h1.6z"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23 12c0-2.1-.2-3.5-.6-4.4-.3-.8-1-1.5-1.8-1.8C18.7 5.3 12 5.3 12 5.3s-6.7 0-8.6.5c-.8.3-1.5 1-1.8 1.8C1.2 8.5 1 9.9 1 12s.2 3.5.6 4.4c.3.8 1 1.5 1.8 1.8 1.9.5 8.6.5 8.6.5s6.7 0 8.6-.5c.8-.3 1.5-1 1.8-1.8.4-.9.6-2.3.6-4.4zM10 15.5v-7l6 3.5-6 3.5z"/></svg>`,
    twitter: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.7 7.2c.5-.3 1-.8 1.3-1.3-.5.2-1 .4-1.6.5.6-.4 1-1 1.2-1.7-.6.4-1.2.6-1.9.8a3.2 3.2 0 0 0-5.5 2.2c0 .3 0 .5.1.8-2.7-.1-5.2-1.4-6.8-3.5-.3.5-.4 1-.4 1.6 0 1.1.6 2 1.4 2.6-.5 0-1-.2-1.5-.4 0 1.6 1.1 3 2.6 3.3-.3.1-.6.1-.9.1-.2 0-.4 0-.6-.1.4 1.3 1.6 2.3 3 2.3a6.5 6.5 0 0 1-4 1.4H4a9 9 0 0 0 4.9 1.4c5.8 0 9-4.8 9-8.9v-.4c.6-.4 1.1-1 1.5-1.6z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zM18 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>`,
    discord: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 4a18 18 0 0 0-4.9-1.5l-.2.3c1.7.5 3.2 1.2 4.6 2.2a15 15 0 0 0-5.6-1.8 15 15 0 0 0-5.6 1.8c1.4-1 3-1.7 4.6-2.2l-.2-.3A18 18 0 0 0 4 4C1.5 7.6.7 11 1 14.3 3.6 16.2 6 17.4 8.4 18l.8-1.2c-1.6-.6-3-1.4-4.2-2.5.3.3.7.6 1 .8 3.6 2.5 8.5 2.5 12.1 0 .3-.2.7-.5 1-.8-1.2 1.1-2.7 2-4.2 2.5l.8 1.2c2.4-.7 4.8-1.8 7.4-3.7.4-3.3-.4-6.8-3-10.3zM8.7 12.4c0 .8-.6 1.4-1.4 1.4S6 13.2 6 12.4s.6-1.4 1.4-1.4 1.3.6 1.3 1.4zm8.1 0c0 .8-.6 1.4-1.4 1.4s-1.4-.6-1.4-1.4.6-1.4 1.4-1.4 1.4.6 1.4 1.4z"/></svg>`,
    globe: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm7.9 9h-3.1a14.8 14.8 0 0 0-2.2-6 8.02 8.02 0 0 1 5.3 6zM12 4c1.1 1.4 2.1 3.7 2.5 7H9.5C9.9 7.7 10.9 5.4 12 4zM4.2 15a8 8 0 0 1 0-6h3.1c-.2 1-.3 2-.3 3s.1 2 .3 3H4.2zm1.6 2h3.5c.4 2.3 1.4 4.5 2.7 6A8 8 0 0 1 5.8 17zm3.5-10H5.8A8 8 0 0 1 12 3c-1.3 1.5-2.3 3.7-2.7 6zm2.7 16c-1.3-1.5-2.3-3.7-2.7-6h5.4c-.4 2.3-1.4 4.5-2.7 6zM15.5 17H19a8 8 0 0 1-7 6c1.3-1.5 2.3-3.7 2.7-6zm.2-2c.2-1 .3-2 .3-3s-.1-2-.3-3H19a8 8 0 0 1 0 6h-3.3z"/></svg>`
  };
  return icons[name] || icons.globe;
}


