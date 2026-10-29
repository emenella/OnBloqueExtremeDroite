const S = chrome.storage.session, L = chrome.storage.local;
const today = () => new Date().toISOString().slice(0, 10);

async function bump() {
  let { day, count = 0 } = await L.get(["day", "count"]);
  if (day !== today()) count = 0;
  await L.set({ day: today(), count: count + 1 });
}

// Onglets de profil ouverts depuis l'onglet du site
chrome.tabs.onCreated.addListener(async (tab) => {
  const s = await S.get(["running", "siteTab", "work"]);
  if (s.running && tab.openerTabId && tab.openerTabId === s.siteTab) {
    await S.set({ work: [...(s.work || []), tab.id] });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  (async () => {
    const s = await S.get(["running", "siteTab", "work"]);
    const tabId = sender.tab?.id;
    const work = s.work || [];

    if (msg.type === "start") {
      await S.set({ running: true, siteTab: tabId, work: [] });
      reply(true);
    } else if (msg.type === "stop") {
      await S.set({ running: false });
      reply(true);
    } else if (msg.type === "shouldRun") {
      reply(!!s.running && work.includes(tabId));
    } else if (msg.type === "result") {
      if (msg.ok) {
        if (msg.counted) await bump();
        await S.set({ work: work.filter((t) => t !== tabId) });
        chrome.tabs.remove(tabId).catch(() => {});
        chrome.tabs.sendMessage(s.siteTab, { type: "next" }).catch(() => {});
      } else {
        await S.set({ running: false }); // on s'arrête, l'onglet reste ouvert
        chrome.tabs.sendMessage(s.siteTab, { type: "halt", reason: msg.reason }).catch(() => {});
      }
      reply(true);
    }
  })();
  return true;
});
