(() => {
  const S = window.DEMO.shorts;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const I = window.Icon;
  const cats = ["అన్నీ", "🎬 రీల్స్", ...new Set(S.map((s) => s.cat))];
  const KEY = "icon-view";
  const store = { get: () => { try { return localStorage.getItem(KEY); } catch { return null; } },
                  set: (v) => { try { localStorage.setItem(KEY, v); } catch {} } };

  const root = document.createElement("div");
  root.id = "shorts";
  root.innerHTML = `<div class="sh-top"><img src="assets/logo-lockup-dark.png" alt="ఐకాన్ తెలుగు"><span><button class="sh-full sh-me" type="button">⭐</button> <button class="sh-full" type="button">పూర్తి సైట్ →</button></span></div>
    <div class="sh-chips">${cats.map((c, i) => `<button type="button" class="${i ? "" : "on"}">${esc(c)}</button>`).join("")}</div>
    <div class="sh-feed"></div>`;
  document.body.prepend(root);
  const feed = root.querySelector(".sh-feed");

  const toShorts = document.createElement("button");
  toShorts.className = "to-shorts"; toShorts.type = "button"; toShorts.textContent = "⚡ షార్ట్స్";
  document.body.append(toShorts);

  let current = "అన్నీ";
  function render(cat) {
    current = cat;
    if (cat === "🎬 రీల్స్") {
      feed.innerHTML = window.DEMO.reels.map((r) => `<div class="sh-reel"><a href="#" class="reel ${r.c}"><b>${esc(r.title)}</b><span>${r.len} · ఐకాన్ రీల్స్</span></a></div>`).join("");
      feed.scrollTop = 0; return;
    }
    const list = (cat === "అన్నీ" ? S.slice() : S.filter((s) => s.cat === cat)).sort((a, b) => I.score(b) - I.score(a));
    feed.innerHTML = list.map((s, i) => `<article class="sh-card"><div class="sh-in">
      <div class="thumb ${s.c}"><span class="tag">${esc(s.cat)}</span>${s.video ? '<span class="play"></span>' : ""}<span class="sh-count">${i + 1}/${list.length}</span></div>
      <div class="sh-body"><h2>${esc(s.title)}</h2>${s.r ? `<div class="stars"><i>${"★".repeat(Math.round(s.r))}${"☆".repeat(5 - Math.round(s.r))}</i><span>${s.r}/5</span></div>` : ""}
      <p>${esc(s.sum)}</p>
      <div class="sh-foot"><span>${esc(s.district)} · ${esc(s.time)}</span>${I.listenBtn(s.title + ". " + s.sum)}<button type="button" data-share="${i}">షేర్</button><a href="#">${s.video ? "వీడియో చూడండి" : "పూర్తి కథనం"} →</a></div></div></div>
      ${i === 0 && list.length > 1 ? '<div class="sh-hint">↑ తదుపరి వార్త కోసం పైకి స్వైప్ చేయండి</div>' : ""}</article>`).join("");
    feed.scrollTop = 0;
    feed.onclick = (e) => {
      const b = e.target.closest("[data-share]"); if (!b) return;
      const s = list[b.dataset.share], data = { title: s.title, text: s.sum, url: location.href };
      if (navigator.share) navigator.share(data).catch(() => {});
      else navigator.clipboard?.writeText(`${s.title}\n${location.href}`).then(() => { b.textContent = "కాపీ అయింది"; });
    };
  }

  root.querySelector(".sh-chips").onclick = (e) => {
    const b = e.target.closest("button"); if (!b) return;
    root.querySelectorAll(".sh-chips button").forEach((x) => x.classList.toggle("on", x === b));
    b.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    render(b.textContent);
  };
  const setMode = (shorts) => { document.body.classList.toggle("shorts-mode", shorts); store.set(shorts ? "shorts" : "full"); };
  root.querySelector(".sh-me").onclick = () => I.openPrefs();
  window.addEventListener("icon-prefs", () => render(current));
  root.querySelector(".sh-full:not(.sh-me)").onclick = () => { setMode(false); scrollTo(0, 0); };
  toShorts.onclick = () => setMode(true);

  render("అన్నీ");
  setMode(store.get() !== "full");
})();
