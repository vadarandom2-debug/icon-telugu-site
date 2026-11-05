(() => {
  const D = window.DEMO, $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const thumb = (c, tag, extra = "") => `<div class="thumb ${c}">${tag ? `<span class="tag">${esc(tag)}</span>` : ""}${extra}</div>`;
  const card = (s, c, cat) => `<a href="#">${thumb(c, cat)}<h3>${esc(s.title)}</h3><div class="meta">${esc(s.time)}</div></a>`;

  $("today").textContent = new Date().toLocaleDateString("te-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  $("yr").textContent = new Date().getFullYear();

  const t = D.ticker.map((x) => `<span>${esc(x)}</span>`).join("");
  $("tick").innerHTML = t + t;

  const L = D.lead;
  $("lead").innerHTML = `${thumb(L.c, L.cat)}<h2>${esc(L.title)}</h2><p>${esc(L.dek)}</p><div class="meta"><b>ఐకాన్ డెస్క్</b> · ${esc(L.time)}</div>`;
  $("side").innerHTML = D.side.map((s) => `<a class="row" href="#">${thumb(s.c)}<div><p class="eyebrow">${esc(s.cat)}</p><h3>${esc(s.title)}</h3><div class="meta">${esc(s.time)}</div></div></a>`).join("");

  $("pol").innerHTML = D.pol.map((s) => card(s, "c-pol", "రాజకీయాలు")).join("");
  $("most").innerHTML = D.most.map((x) => `<li><a href="#">${esc(x)}</a></li>`).join("");
  $("cin").innerHTML = D.cin.map((s) => card(s, "c-cin", "సినిమా")).join("");
  $("rev").innerHTML = D.rev.map((s) => {
    const full = Math.round(s.r);
    return `<a class="rev" href="#">${thumb("c-cin", "రివ్యూ")}<h3>${esc(s.title)}</h3><div class="stars"><i>${"★".repeat(full)}${"☆".repeat(5 - full)}</i><span>${s.r}/5</span></div></a>`;
  }).join("");
  $("vid").innerHTML = D.vid.map((s) => `<a href="#">${thumb("c-vid", s.time, '<span class="play"></span>')}<h3>${esc(s.title)}</h3></a>`).join("");
  $("nriG").innerHTML = D.nri.map((s) => card(s, "c-nri", "ఎన్నారై")).join("");
})();
