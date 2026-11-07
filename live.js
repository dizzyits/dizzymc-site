/* Shows a red "LIVE on Twitch" banner and animated arrows on the Twitch button
   while your stream is live. Checks every 15 seconds, no refresh needed.
   Uses the free decapi.me status API (no key needed).
   Test it any time by opening the page with ?live=1 on the end of the address. */
(function () {
  var channel = (typeof SITE !== "undefined" && SITE.twitchChannel) || "";
  if (!/^[\w]+$/.test(channel)) return;
  var url = "https://www.twitch.tv/" + channel;
  var name = (typeof SITE !== "undefined" && SITE.name) || "Dizzyits";
  var forced = /[?&]live=1\b/.test(location.search);
  var testCh = (location.search.match(/[?&]testchannel=(\w+)/) || [])[1]; // for testing only
  if (testCh) channel = testCh;
  var isLive = false;

  var css = document.createElement("style");
  css.textContent =
    "#liveBanner{position:fixed;top:0;left:0;right:0;z-index:9999;display:none;align-items:center;justify-content:center;gap:10px;" +
    "height:44px;padding:0 14px;background:#e3101f;color:#fff;font:800 .95rem/1 system-ui,Segoe UI,sans-serif;letter-spacing:.04em;" +
    "text-transform:uppercase;text-decoration:none;border-bottom:3px solid #000;box-shadow:0 3px 0 rgba(0,0,0,.25)}" +
    "#liveBanner:hover{background:#ff2433}" +
    "#liveBanner i{width:12px;height:12px;border-radius:50%;background:#fff;animation:liveDot 1s infinite}" +
    "body.live-on #liveBanner{display:flex}body.live-on{margin-top:44px}" +
    "@keyframes liveDot{50%{opacity:.25;transform:scale(.7)}}" +
    ".live-target{position:relative;outline:3px solid #e3101f;outline-offset:2px}" +
    ".live-arrow{position:absolute;top:50%;margin-top:-18px;width:36px;height:36px;display:grid;place-items:center;" +
    "background:#e3101f;color:#fff;border:3px solid #000;border-radius:50%;font:900 1.1rem/1 system-ui,sans-serif;z-index:5;pointer-events:none}" +
    ".live-target{margin-left:50px!important;margin-right:50px!important}" +
    ".live-arrow.l{left:-46px;animation:arrowL 1s ease-in-out infinite}" +
    ".live-arrow.r{right:-46px;animation:arrowR 1s ease-in-out infinite}" +
    "@keyframes arrowL{0%,100%{transform:translateX(-10px)}50%{transform:translateX(8px)}}" +
    "@keyframes arrowR{0%,100%{transform:translateX(10px)}50%{transform:translateX(-8px)}}" +
    "@media(max-width:640px){.live-target{margin-left:42px!important;margin-right:42px!important}.live-arrow.l{left:-38px}.live-arrow.r{right:-38px}.live-arrow{width:30px;height:30px;margin-top:-15px}}" +
    "#livePreview{position:relative;width:100%;aspect-ratio:16/9;margin:0 0 22px;background:#000;border:3px solid #000;box-shadow:4px 4px 0 #000;border-radius:6px;overflow:hidden}" +
    "#livePreview iframe{position:absolute;inset:0;width:100%;height:100%;border:0}" +
    "#livePreview span{position:absolute;top:8px;left:8px;z-index:2;background:#e3101f;color:#fff;font:800 .7rem/1 system-ui,sans-serif;letter-spacing:.06em;padding:5px 8px;border-radius:4px;pointer-events:none}" +
    "@media(prefers-reduced-motion:reduce){.live-arrow,#liveBanner i{animation:none}}";
  document.head.appendChild(css);

  var banner = document.createElement("a");
  banner.id = "liveBanner";
  banner.href = url;
  banner.target = "_blank";
  banner.rel = "noopener";
  banner.innerHTML = "<i></i><span></span>";
  banner.lastChild.textContent = name + " is LIVE on Twitch — click to watch";
  document.body.insertBefore(banner, document.body.firstChild);

  function targets() {
    return Array.prototype.slice.call(document.querySelectorAll('a[href*="twitch.tv"]'))
      .filter(function (a) { return a.id !== "liveBanner"; });
  }

  function apply(on) {
    if (on === isLive) return;
    isLive = on;
    document.body.classList.toggle("live-on", on);

    // Muted autoplay preview of the stream (only on pages with the link list)
    var list = document.querySelector(".list");
    var prev = document.getElementById("livePreview");
    if (on && list && !prev) {
      prev = document.createElement("div");
      prev.id = "livePreview";
      prev.innerHTML = '<span>● LIVE NOW</span><iframe allowfullscreen title="Live stream preview" allow="autoplay; fullscreen"></iframe>';
      prev.querySelector("iframe").src = "https://player.twitch.tv/?channel=" + channel +
        "&muted=true&autoplay=true&parent=" + encodeURIComponent(location.hostname || "localhost");
      list.parentNode.insertBefore(prev, list);
    } else if (!on && prev) {
      prev.remove();
    }
    targets().forEach(function (a) {
      var arrows = a.querySelectorAll(".live-arrow");
      if (on && !arrows.length) {
        a.classList.add("live-target");
        a.insertAdjacentHTML("beforeend", '<span class="live-arrow l">▶</span><span class="live-arrow r">◀</span>');
      } else if (!on) {
        a.classList.remove("live-target");
        arrows.forEach(function (x) { x.remove(); });
      }
    });
  }

  function check() {
    if (forced) return apply(true);
    fetch("https://decapi.me/twitch/uptime/" + channel + "?t=" + Date.now(), { cache: "no-store" })
      .then(function (r) { return r.text(); })
      .then(function (t) { if (/offline/i.test(t)) apply(false); else if (/\d+\s*(second|minute|hour|day)/i.test(t)) apply(true); })
      .catch(function () {});
  }

  /* Real-time detection: a hidden Twitch player tells us the moment the channel
     goes online or offline (Twitch's own signal, no delay, no refresh needed).
     The decapi check above is only a backup if the player can't load. */
  var probeOk = false;
  var probeN = 0;
  function probeOnce() {
    // A paused player only reports the channel state when it loads, so we load a
    // fresh hidden player every 20 seconds and read what it says.
    var old = document.getElementById("liveProbe" + probeN);
    var id = "liveProbe" + (++probeN);
    var box = document.createElement("div");
    box.id = id;
    box.style.cssText = "position:fixed;left:-9999px;top:0;width:400px;height:225px;opacity:0;pointer-events:none";
    document.body.appendChild(box);
    try {
      var p = new Twitch.Player(id, {
        channel: channel, parent: [location.hostname || "localhost"],
        muted: true, autoplay: false, width: 400, height: 225
      });
      p.addEventListener(Twitch.Player.ONLINE, function () { probeOk = true; apply(true); });
      p.addEventListener(Twitch.Player.OFFLINE, function () { probeOk = true; apply(false); });
    } catch (e) {}
    // remove the previous probe once the new one is up
    setTimeout(function () { if (old && old.parentNode) old.parentNode.removeChild(old); }, 8000);
  }
  function startProbe() {
    probeOnce();
    setInterval(probeOnce, 20000);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) probeOnce(); });
  }

  if (forced) {
    apply(true);
  } else {
    var sc = document.createElement("script");
    sc.src = "https://embed.twitch.tv/embed/v1.js";
    sc.onload = startProbe;
    document.head.appendChild(sc);
    setTimeout(function () {
      if (probeOk) return;
      check();
      setInterval(function () { if (!probeOk) check(); }, 15000);
    }, 12000);
  }
})();

/* Live YouTube subscriber banner. Shows at the top whenever you are NOT live on Twitch
   (the red LIVE banner takes its place during a stream, then this comes back).
   Refreshes every 15 seconds with no page refresh. Free public counter APIs, no key. */
(function () {
  var id = (typeof SITE !== "undefined" && SITE.youtubeChannelId) || "";
  if (!/^UC[\w-]{20,}$/.test(id)) return;
  var ytUrl = (typeof SITE !== "undefined" && SITE.links && SITE.links.youtube) || "https://www.youtube.com/";
  var name = (typeof SITE !== "undefined" && SITE.name) || "Dizzyits";

  var css = document.createElement("style");
  css.textContent =
    "#subBanner{position:fixed;top:0;left:0;right:0;z-index:9998;display:none;align-items:center;justify-content:center;gap:12px;" +
    "height:44px;padding:0 14px;color:#fff;font:800 .95rem/1 system-ui,Segoe UI,sans-serif;letter-spacing:.03em;text-decoration:none;" +
    "background:linear-gradient(90deg,#1a1050,#2f2fb8,#6a2bd9,#2f2fb8,#1a1050);background-size:300% 100%;animation:subSweep 8s linear infinite;" +
    "border-bottom:2px solid #7fa8ff;box-shadow:0 0 18px rgba(106,92,255,.55)}" +
    "#subBanner:hover{filter:brightness(1.2)}" +
    "#subBanner b{font-size:1.25rem;letter-spacing:.02em;font-variant-numeric:tabular-nums;text-shadow:0 0 10px #9db8ff}" +
    "#subBanner .yt{display:inline-block;width:22px;height:16px;border-radius:5px;background:#f00;position:relative;flex:none}" +
    "#subBanner .yt:after{content:'';position:absolute;left:8px;top:4px;border-left:7px solid #fff;border-top:4px solid transparent;border-bottom:4px solid transparent}" +
    "#subBanner .pulse{width:8px;height:8px;border-radius:50%;background:#5dffa0;animation:subPulse 1.6s infinite;flex:none}" +
    "body.sub-on:not(.live-on) #subBanner{display:flex}body.sub-on{margin-top:44px}" +
    "body.sub-on .about-btn{top:60px!important}" +
    "@keyframes subSweep{to{background-position:300% 0}}" +
    "@keyframes subPulse{50%{opacity:.25;transform:scale(.7)}}" +
    "@media(max-width:640px){#subBanner{font-size:.8rem;gap:8px}#subBanner b{font-size:1.05rem}body.sub-on .about-btn{top:54px!important}}" +
    "@media(prefers-reduced-motion:reduce){#subBanner,#subBanner .pulse{animation:none}}";
  document.head.appendChild(css);

  var el = document.createElement("a");
  el.id = "subBanner";
  el.href = ytUrl;
  el.target = "_blank";
  el.rel = "noopener";
  el.innerHTML = '<span class="yt"></span><span class="t1"></span><b>0</b><span class="t2">subscribers</span><span class="pulse" title="Live count"></span>';
  el.querySelector(".t1").textContent = name + " on YouTube:";
  document.body.insertBefore(el, document.body.firstChild);
  var num = el.querySelector("b");
  var shown = null, anim = null;

  function render(n) {
    if (shown === null) { shown = n; num.textContent = n.toLocaleString(); return; }
    if (n === shown) return;
    var from = shown, to = n, t0 = Date.now();
    shown = n;
    clearInterval(anim);
    anim = setInterval(function () {
      var k = Math.min(1, (Date.now() - t0) / 900);
      num.textContent = Math.round(from + (to - from) * k).toLocaleString();
      if (k >= 1) clearInterval(anim);
    }, 40);
  }
  function got(n) {
    if (typeof n !== "number" || !isFinite(n) || n < 0) return false;
    render(n);
    document.body.classList.add("sub-on");
    return true;
  }
  function viaSocial() {
    return fetch("https://api.socialcounts.org/youtube-live-subscriber-count/" + id, { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (j) { var c = j.counters || {}; return got((c.estimation || c.api || {}).subscriberCount); });
  }
  function viaMixerno() {
    return fetch("https://mixerno.space/api/youtube-channel-counter/user/" + id, { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var c = (j.counts || []).filter(function (x) { return x.value === "subscribers"; })[0];
        return got(c && c.count);
      });
  }
  function update() {
    viaSocial().then(function (ok) { if (!ok) return viaMixerno(); }).catch(function () { return viaMixerno().catch(function () {}); });
  }
  update();
  setInterval(update, 15000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) update(); });
})();
