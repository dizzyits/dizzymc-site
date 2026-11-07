/* Fills every <div class="ad-slot"></div> with a Google AdSense ad.
   Does nothing until you fill in ADS.client and ADS.slot in content.js,
   so the pages look clean until your AdSense account is approved. */
(function () {
  if (typeof ADS === "undefined" || !/^ca-pub-\d+$/.test(ADS.client || "") || !/^\d+$/.test(ADS.slot || "")) {
    document.querySelectorAll(".ad-slot").forEach(function (el) { el.remove(); });
    return;
  }
  var s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + ADS.client;
  document.head.appendChild(s);

  document.querySelectorAll(".ad-slot").forEach(function (el) {
    el.innerHTML = '<small>Advertisement</small>' +
      '<ins class="adsbygoogle" style="display:block" data-ad-client="' + ADS.client +
      '" data-ad-slot="' + ADS.slot + '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  });
})();
