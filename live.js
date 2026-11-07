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
      .then(function (t) { apply(!/offline|not found|error|no user/i.test(t) && t.trim().length > 0); })
      .catch(function () {});
  }

  check();
  setInterval(check, 15000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) check(); });
  window.addEventListener("focus", check);
})();
