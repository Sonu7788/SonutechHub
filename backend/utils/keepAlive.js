import https from 'https';
import http from 'http';

/**
 * Self-pinging keep-alive mechanism to prevent Render free tier instances
 * from spinning down / going to sleep after 15 minutes of inactivity.
 */
export function initKeepAlive() {
  // Render automatically injects RENDER_EXTERNAL_URL (e.g. https://sonutechhub.onrender.com)
  const serverUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL;
  
  // Ping interval: Every 13 minutes (780,000 ms) - Render sleeps at 15 minutes
  const INTERVAL_MS = 13 * 60 * 1000;

  if (!serverUrl) {
    console.log('ℹ️ Keep-Alive: No RENDER_EXTERNAL_URL or SERVER_URL detected. Self-ping idle in local mode.');
    return;
  }

  const pingUrl = serverUrl.endsWith('/') ? `${serverUrl}api/health` : `${serverUrl}/api/health`;
  console.log(`⏱️ Keep-Alive initialized: Pinging ${pingUrl} every 13 minutes to keep Render alive.`);

  setInterval(() => {
    try {
      const client = pingUrl.startsWith('https') ? https : http;
      
      const req = client.get(pingUrl, (res) => {
        if (res.statusCode === 200) {
          console.log(`[${new Date().toLocaleTimeString()}] ✅ Keep-Alive Ping Successful (${pingUrl})`);
        } else {
          console.warn(`[${new Date().toLocaleTimeString()}] ⚠️ Keep-Alive Ping responded with status: ${res.statusCode}`);
        }
      });

      req.on('error', (err) => {
        console.error(`[${new Date().toLocaleTimeString()}] ❌ Keep-Alive Ping Error:`, err.message);
      });

      req.setTimeout(10000, () => {
        req.destroy();
      });
    } catch (err) {
      console.error('Keep-Alive Execution Exception:', err.message);
    }
  }, INTERVAL_MS);
}
