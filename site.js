// ⚠️ À ajuster selon les libellés du site
const OPEN = /ouvrir le profil/i;
const DONE = /j.ai bloqué|déjà bloqué|marquer|suivant/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const today = () => new Date().toISOString().slice(0, 10);
const visible = (el) => el.getClientRects().length > 0;
const findBtn = (re) =>
  [...document.querySelectorAll("button, a, [role=button]")].find(
    (el) => visible(el) && re.test(el.textContent.trim())
  );

// ---------- Panneau (Shadow DOM) ----------
const host = document.createElement("div");
host.style.cssText = "all:initial;position:fixed;right:16px;bottom:16px;z-index:2147483647";
const root = host.attachShadow({ mode: "open" });
root.innerHTML = `
<style>
  .card{width:260px;background:#0f1115;color:#e8eaed;border:1px solid #262a33;border-radius:14px;padding:14px;font:13px/1.4 system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.45)}
  .head{display:flex;align-items:center;gap:8px;font-weight:600}
  .dot{width:9px;height:9px;border-radius:50%;background:#6b7280}
  .dot.run{background:#22c55e;animation:p 1.2s infinite}
  .dot.err{background:#ef4444}
  @keyframes p{50%{opacity:.35}}
  .msg{margin:10px 0 8px;color:#a0a6b1;min-height:18px}
  .bar{height:6px;background:#1c2029;border-radius:99px;overflow:hidden}
  .fill{height:100%;width:0;background:#22c55e;transition:width .3s}
  .meta{display:flex;justify-content:space-between;margin:6px 0 12px;font-size:12px;color:#8b92a0}
  button{all:unset;box-sizing:border-box;width:100%;text-align:center;padding:9px;border-radius:9px;background:#2563eb;color:#fff;font-weight:600;cursor:pointer}
  button.stop{background:#dc2626}
  button:hover{filter:brightness(1.12)}
</style>
<div class="card">
  <div class="head"><span class="dot" id="dot"></span>Bloqueur auto</div>
  <div class="msg" id="msg">Prêt</div>
  <div class="bar" id="track"><div class="fill" id="fill"></div></div>
  <div class="meta"><span id="count">0 aujourd'hui</span><span id="cap"></span></div>
  <button id="btn">▶ Démarrer</button>
</div>`;
document.body.appendChild(host);
const $ = (id) => root.getElementById(id);

function setState(state, text) { // "idle" | "run" | "err"
  $("dot").className = "dot " + (state === "idle" ? "" : state);
  $("msg").textContent = text;
  $("btn").textContent = state === "run" ? "■ Arrêter" : "▶ Démarrer";
  $("btn").className = state === "run" ? "stop" : "";
}

async function refreshCount() {
  let { day, count = 0, cap = 20, unlimited = false } =
    await chrome.storage.local.get(["day", "count", "cap", "unlimited"]);
  if (day !== today()) count = 0;
  $("count").textContent = `${count} aujourd'hui`;
  $("cap").textContent = unlimited ? "illimité" : `max ${cap}`;
  $("track").style.display = unlimited ? "none" : "";
  $("fill").style.width = Math.min(100, (count / cap) * 100) + "%";
}
chrome.storage.onChanged.addListener(refreshCount);
refreshCount();

// ---------- Logique ----------
let running = false;

async function underCap() {
  let { day, count = 0, cap = 20, unlimited = false } =
    await chrome.storage.local.get(["day", "count", "cap", "unlimited"]);
  if (unlimited) return true;
  if (day !== today()) count = 0;
  return count < cap;
}

async function countdown(ms) {
  for (let t = Math.ceil(ms / 1000); t > 0 && running; t--) {
    setState("run", `Prochain profil dans ${t} s…`);
    await sleep(1000);
  }
}

async function openNext() {
  if (!running) return;
  if (!(await underCap())) return stop("Limite journalière atteinte");
  const b = findBtn(OPEN);
  if (!b) return stop("Bouton « ouvrir le profil » introuvable");
  setState("run", "Ouverture du profil…");
  b.click();
}

function stop(msg = "Arrêté", isErr = false) {
  running = false;
  chrome.runtime.sendMessage({ type: "stop" });
  setState(isErr ? "err" : "idle", msg);
}

$("btn").onclick = async () => {
  if (running) return stop();
  running = true;
  setState("run", "Démarrage…");
  await chrome.runtime.sendMessage({ type: "start" });
  openNext();
};

chrome.runtime.onMessage.addListener(async (msg) => {
  if (!running) return;
  if (msg.type === "halt") return stop("Pause : " + (msg.reason || "erreur"), true);
  if (msg.type === "next") {
    setState("run", "Profil traité ✓");
    await sleep(rand(500, 1000));
    const d = findBtn(DONE);
    if (d) d.click();
    await countdown(rand(1500, 3000)); // délai humain entre deux profils
    openNext();
  }
});