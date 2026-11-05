// Advanced layer: theme, PWA, since-last-visit, live hub, My Icon prefs, listen (TTS), reels.
(() => {
  const D = window.DEMO, $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
               set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };

  // ---- theme
  const applyTheme = (t) => { if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme; };
  applyTheme(ls.get("icon-theme", null));
  const isDark = () => (document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "dark";

  // ---- prefs
  const prefs = ls.get("icon-prefs", { districts: [], topics: [] });
  const score = (s) => (prefs.districts.includes(s.district) ? 2 : 0) + (prefs.topics.includes(s.cat) ? 1 : 0);
  const hasPrefs = () => prefs.districts.length + prefs.topics.length > 0;

  // ---- listen (Telugu TTS where the device has a voice)
  let speakingBtn = null;
  function speak(text, btn) {
    const ss = window.speechSynthesis; if (!ss) { alert("ఈ బ్రౌజర్‌లో ఆడియో సపోర్ట్ లేదు"); return; }
    const same = speakingBtn === btn; ss.cancel();
    if (speakingBtn) { speakingBtn.classList.remove("playing"); speakingBtn.textContent = "🔊 వినండి"; speakingBtn = null; }
    if (same) return;
    const u = new SpeechSynthesisUtterance(text); u.lang = "te-IN"; u.rate = 0.95;
    const v = ss.getVoices().find((x) => x.lang.startsWith("te")); if (v) u.voice = v;
    u.onend = () => { btn.classList.remove("playing"); btn.textContent = "🔊 వినండి"; speakingBtn = null; };
    btn.classList.add("playing"); btn.textContent = "⏸ ఆపండి"; speakingBtn = btn; ss.speak(u);
  }
  const listenBtn = (text) => `<button type="button" class="listen" data-say="${esc(text)}">🔊 వినండి</button>`;
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-say]"); if (b) { e.preventDefault(); speak(b.dataset.say, b); } });

  window.Icon = { prefs, score, hasPrefs, listenBtn, esc, openPrefs: () => openPrefs() };

  document.addEventListener("DOMContentLoaded", () => {
    // utility-bar tools + dual logos
    $(".util .wrap").insertAdjacentHTML("beforeend", `<div class="tools"><button type="button" id="myIcon" class="gold">⭐ మై ఐకాన్</button><button type="button" id="themeBtn"></button></div>`);
    const themeBtn = $("#themeBtn"), label = () => { themeBtn.textContent = isDark() ? "☀️ లైట్" : "🌙 డార్క్"; };
    label();
    themeBtn.onclick = () => { const t = isDark() ? "light" : "dark"; applyTheme(t); ls.set("icon-theme", t); label(); };
    const logo = $(".mast img"); logo.classList.add("light");
    logo.insertAdjacentHTML("afterend", '<img class="dark" src="assets/logo-lockup-dark.png" alt="ఐకాన్ తెలుగు">');

    // since last visit
    const last = ls.get("icon-last-visit", 0), now = Date.now();
    const hrs = (t) => { const n = parseFloat(t); return /రోజు/.test(t) ? n * 24 : /గం/.test(t) ? n : 0; };
    const fresh = last ? D.shorts.filter((s) => now - hrs(s.time) * 3.6e6 > last).length + D.live.incoming.length : 0;
    $(".ticker").insertAdjacentHTML("afterend", `<div class="since"><div class="wrap">${last
      ? `🔔 మీరు చివరిసారి వచ్చినప్పటి నుంచి <b>${fresh}</b> కొత్త అప్‌డేట్లు`
      : "👋 ఐకాన్ తెలుగుకు స్వాగతం — ⭐ మై ఐకాన్‌లో మీ జిల్లా, ఆసక్తులు ఎంచుకోండి"}<button type="button" aria-label="మూసివేయి">×</button></div></div>`);
    $(".since button").onclick = (e) => e.target.closest(".since").remove();
    ls.set("icon-last-visit", now);

    // listen on lead story
    $("#lead .meta").insertAdjacentHTML("afterend", `<div class="sh-tools">${listenBtn(D.lead.title + ". " + D.lead.dek)}</div>`);

    // live hub + for-you, after the top grid
    const L = D.live;
    $("main.wrap").insertAdjacentHTML("afterend", `
      <section class="sec" id="live"><div class="wrap live">
        <div class="card"><div class="live-head"><span class="live-badge">లైవ్</span><h2>${esc(L.title)}</h2></div>
          <ol id="liveList">${L.entries.slice().reverse().map((x) => `<li><time>${x.t}</time>${esc(x.text)}</li>`).join("")}</ol></div>
        <div class="card for-you"><p class="eyebrow">మీ కోసం</p><div class="chips" id="fyChips"></div><div class="side-list" id="fyList"></div></div>
      </div></section>
      <section class="sec alt" id="reels"><div class="wrap">
        <div class="sec-head"><h2>రీల్స్</h2><a href="#">అన్నీ →</a></div>
        <div class="reels">${D.reels.map((r) => `<a href="#" class="reel ${r.c}"><b>${esc(r.title)}</b><span>${r.len}</span></a>`).join("")}</div>
      </div></section>`);
    let i = 0;
    const tick = setInterval(() => {
      if (i >= L.incoming.length) return clearInterval(tick);
      const t = new Date(); const li = document.createElement("li"); li.className = "new";
      li.innerHTML = `<time>${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}</time>${esc(L.incoming[i++])}`;
      $("#liveList").prepend(li);
    }, 15000);

    renderForYou();
    buildModal();
  });

  function renderForYou() {
    const chips = [...prefs.districts, ...prefs.topics];
    $("#fyChips").innerHTML = chips.length ? chips.map((c) => `<span class="pill on">${esc(c)}</span>`).join("") + '<button type="button" class="pill" id="fyEdit">మార్చండి</button>'
      : '<button type="button" class="pill on" id="fyEdit">⭐ మీ జిల్లా, ఆసక్తులు ఎంచుకోండి</button>';
    $("#fyEdit").onclick = openPrefs;
    const list = D.shorts.slice().sort((a, b) => score(b) - score(a)).slice(0, 4);
    $("#fyList").innerHTML = list.map((s) => `<a class="row" href="#"><div class="thumb ${s.c}"></div><div><p class="eyebrow">${esc(s.cat)} · ${esc(s.district)}</p><h3>${esc(s.title)}</h3><div class="meta">${esc(s.time)}</div></div></a>`).join("");
  }

  function buildModal() {
    const pick = (arr, key) => arr.map((x) => `<button type="button" class="pill ${prefs[key].includes(x) ? "on" : ""}" data-k="${key}">${esc(x)}</button>`).join("");
    document.body.insertAdjacentHTML("beforeend", `<div class="modal" id="prefs"><div class="card">
      <h3>⭐ మై ఐకాన్</h3><p class="muted small">లాగిన్ అవసరం లేదు — మీ ఎంపికలు ఈ ఫోన్‌లోనే ఉంటాయి.</p>
      <h4>మీ జిల్లాలు</h4><div class="chips">${pick(D.districts, "districts")}</div>
      <h4>మీ ఆసక్తులు</h4><div class="chips">${pick(D.topics, "topics")}</div>
      <button type="button" class="go">సేవ్ చేయండి</button></div></div>`);
    const m = $("#prefs");
    m.onclick = (e) => {
      if (e.target === m) return m.classList.remove("open");
      const b = e.target.closest("[data-k]");
      if (b) { b.classList.toggle("on"); return; }
      if (e.target.closest(".go")) {
        for (const k of ["districts", "topics"]) prefs[k] = [...m.querySelectorAll(`[data-k="${k}"].on`)].map((x) => x.textContent);
        ls.set("icon-prefs", prefs); m.classList.remove("open"); renderForYou();
        window.dispatchEvent(new Event("icon-prefs"));
      }
    };
    $("#myIcon").onclick = openPrefs;
  }
  function openPrefs() { $("#prefs").classList.add("open"); }

  // ---- PWA
  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
