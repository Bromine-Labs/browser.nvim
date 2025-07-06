importScripts(
  "https://unpkg.com/@titaniumnetwork-dev/ultraviolet@3.2.10/dist/uv.bundle.js",
)
importScripts("uv.config.js")
importScripts(__uv$config.sw)
importScripts("/scram/scramjet.shared.js", "/scram/scramjet.worker.js")

if (navigator.userAgent.includes("Firefox")) {
  Object.defineProperty(globalThis, "crossOriginIsolated", {
    value: true,
    writable: true,
  })
}

// Fetch vencord and store the text in a variable
self.vencordjs = "";
self.vencordcss = "";
async function loadVC() {
    self.vencordjs = await fetch("https://raw.githubusercontent.com/Vencord/builds/main/browser.js").then(response => response.text());
    self.vencordcss = await fetch("https://raw.githubusercontent.com/Vencord/builds/main/browser.css").then(response => response.text());
    self.__uv$config.inject = [{
        host: "google.com",
        html: `<script>
            console.log("injected from uv!")
            </script>`,
        injectTo: "head"
    },
    {
        host: "discord.com",
        html: `
            <script>${vencordjs}</script>
            <style>${vencordcss}</style>
        `,
        injectTo: "head"
    }];
}
loadVC();


const uv = new UVServiceWorker()
const scramjet = new ScramjetServiceWorker()

self.addEventListener("install", () => {
  self.skipWaiting()
})

async function handleRequest(event) {
  await scramjet.loadConfig()

  if (scramjet.route(event)) return scramjet.fetch(event)

  if (uv.route(event)) return await uv.fetch(event)

  return await fetch(event.request)
}

self.addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event))
})
