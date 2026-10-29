const $ = (id) => document.getElementById(id);
const CIRC = 2 * Math.PI * 34;
const today = () => new Date().toISOString().slice(0, 10);
const NETS = { x: "X", instagram: "Instagram", tiktok: "TikTok", facebook: "Facebook" };

// Partie qui se met à jour en direct (compteurs, état)
async function render() {
  const [l, s] = await Promise.all([
    chrome.storage.local.get(["cap", "unlimited", "day", "count", "stats"]),
    chrome.storage.session.get(["running"]),
  ]);
  const count = l.day === today() ? l.count || 0 : 0;
  const cap = l.cap || 20;
  const stats = l.stats || {};

  $("pill").className = "pill" + (s.running ? " run" : "");
  $("pillTxt").textContent = s.running ? "En cours" : "Inactif";

  $("n").textContent = count;
  if (l.unlimited) {
    $("of").textContent = "illimité";
    $("left").textContent = "Sans limite";
    $("fg").style.strokeDashoffset = CIRC;
  } else {
    $("of").textContent = "/ " + cap;
    const left = Math.max(0, cap - count);
    $("left").textContent = left ? `${left} restant${left > 1 ? "s" : ""}` : "Limite atteinte";
    $("fg").style.strokeDashoffset = CIRC * (1 - Math.min(1, count / cap));
  }

  $("total").textContent = Object.values(stats).reduce((a, b) => a + b, 0);
}

// Réglages : chargés une seule fois (pour ne pas écraser ce que tu tapes)
async function initSettings() {
  const { confirm = false, cap = 20, unlimited = false } =
    await chrome.storage.local.get(["confirm", "cap", "unlimited"]);
  $("confirm").checked = confirm;
  $("unlimited").checked = unlimited;
  $("cap").value = cap;
  $("capRow").classList.toggle("off", unlimited);
}

const setCap = (v) => {
  v = Math.max(1, Math.round(+v) || 20);
  $("cap").value = v;
  chrome.storage.local.set({ cap: v });
};

$("confirm").onchange = (e) => chrome.storage.local.set({ confirm: e.target.checked });
$("unlimited").onchange = (e) => {
  $("capRow").classList.toggle("off", e.target.checked);
  chrome.storage.local.set({ unlimited: e.target.checked });
};
$("cap").onchange = (e) => setCap(e.target.value);
$("minus").onclick = () => setCap(+$("cap").value - 5);
$("plus").onclick = () => setCap(+$("cap").value + 5);
$("reset").onclick = () => chrome.storage.local.set({ day: today(), count: 0 });

chrome.storage.onChanged.addListener(render); // local + session
initSettings();
render();