(async () => {
  const ok = await chrome.runtime.sendMessage({ type: "shouldRun" });
  if (!ok) return; // page ouverte normalement : on ne touche à rien

  const { confirm = true } = await chrome.storage.local.get("confirm");
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = (a, b) => a + Math.random() * (b - a);
  const visible = (el) => el.getClientRects().length > 0;
  const TAGS = "button,[role=button],[role=menuitem],li,div,span";

  // Élément le plus profond dont le texte correspond
  const byText = (re, scope = TAGS) => () => {
  const m = [...document.querySelectorAll(scope)].filter(
    (el) => visible(el) && re.test(el.textContent.trim())
  );
  return m.find((el) => !m.some((o) => o !== el && el.contains(o)));
};
  const waitFor = async (fn, timeout = 12000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      const el = fn();
      if (el) return el;
      await sleep(250);
    }
    throw new Error("élément introuvable");
  };
  const click = async (el) => {
    el.scrollIntoView({ block: "center" });
    await sleep(rand(300, 800));
    el.click();
  };
  const BLOCK = /^(Bloquer|Block)$/i;

  const flows = {
    x: async () => {
      await click(await waitFor(() => document.querySelector('[data-testid="userActions"]')));
      await sleep(rand(300, 800));
      await click(await waitFor(() => document.querySelector('[data-testid="block"]')));
      await click(await waitFor(() => document.querySelector('[data-testid="confirmationSheetConfirm"]')));
    },
    instagram: async () => {
      const svg = await waitFor(() =>
        document.querySelector('svg[aria-label="Options"], svg[aria-label="Plus d’options"], svg[aria-label="More options"]')
      );
      await click(svg.closest("button,[role=button]") || svg);
      await click(await waitFor(byText(BLOCK, "span")));
      await sleep(900);
      await click(await waitFor(byText(BLOCK, "button")));
      await sleep(1000);
    },
    tiktok: async () => {
      await click(await waitFor(() => document.querySelector('[data-e2e="user-more"]')));
      await click(await waitFor(byText(BLOCK)));
      await sleep(900);
      await click(await waitFor(byText(BLOCK, "button")));
    },
    facebook: async () => { // best-effort, non testé
      await click(await waitFor(() =>
        document.querySelector('[aria-label="Paramètres du profil voir plus d’options"],[aria-label="Profile settings see more options"]')
      ));
      await click(await waitFor(byText(BLOCK, "span")));
      await sleep(900);
      await click(await waitFor(byText(/^(confirmer|confirm)$/i, "span")));
    },
    youtube: async () => { throw new Error("YouTube non automatisé : bloque à la main"); },
  };

  const h = location.hostname;
  const net = /(^|\.)(x|twitter)\.com$/.test(h) ? "x" : h.includes("instagram") ? "instagram"
    : h.includes("tiktok") ? "tiktok" : h.includes("facebook") ? "facebook" : "youtube";

  const report = (okk, extra = {}) => chrome.runtime.sendMessage({ type: "result", ok: okk, ...extra });

  async function run() {
    try {
      // Déjà bloqué ?
      if (byText(/^(débloquer|unblock|bloqué|blocked)$/i)()) return report(true, { counted: false });
      await flows[net]();
      await sleep(1500);
      report(true, { counted: true });
    } catch (e) {
      banner("Échec : " + e.message + " — l'automatisation est en pause.");
      report(false, { reason: e.message });
    }
  }

    // ---------- Barre (Shadow DOM) ----------
  const host = document.createElement("div");
  host.style.cssText = "all:initial;position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:2147483647";
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `
  <style>
    .bar{display:flex;align-items:center;gap:10px;background:#0f1115;color:#e8eaed;border:1px solid #262a33;border-radius:12px;padding:10px 14px;font:14px system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.45)}
    .spin{width:14px;height:14px;box-sizing:border-box;border:2px solid #3b4150;border-top-color:#22c55e;border-radius:50%;animation:s .8s linear infinite}
    .err .spin{animation:none;border-color:#ef4444;background:#ef4444}
    .ok .spin{animation:none;border-color:#22c55e;background:#22c55e}
    @keyframes s{to{transform:rotate(360deg)}}
    button{all:unset;cursor:pointer;padding:6px 12px;border-radius:8px;font-weight:600;background:#dc2626;color:#fff}
    button.ghost{background:#262a33}
    button:hover{filter:brightness(1.15)}
  </style>
  <div class="bar" id="bar"><span class="spin"></span><span id="t"></span><span id="acts"></span></div>`;
  document.body.appendChild(host);
  const $ = (id) => root.getElementById(id);
  const banner = (t, cls = "") => {
    $("bar").className = "bar " + cls;
    $("t").textContent = t;
  };

  if (confirm) {
    banner("Vérifie le profil");
    $("acts").innerHTML = `<button id="b1">🚫 Bloquer</button> <button id="b2" class="ghost">Passer</button>`;
    $("b1").onclick = () => { $("acts").innerHTML = ""; banner("Blocage…"); run(); };
    $("b2").onclick = () => report(true, { counted: false });
  } else {
    banner("Blocage automatique…");
    await sleep(rand(2000, 4000));
    run();
  }
})();
