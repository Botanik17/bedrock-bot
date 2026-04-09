const bedrock = require('bedrock-protocol');
const express = require('express');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3000;

// Webserver für Render (wichtig!)
app.get('/', (req, res) => {
  res.send('Minecraft Bedrock Bot läuft!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Webserver läuft auf Port ${PORT}`);
});

// ==============================
// Minecraft Bot Funktionen
// ==============================

let client = null;

function startBot() {
  if (client) {
    console.log('Bot läuft bereits.');
    return;
  }

  console.log('Starte den Minecraft Bot...');

  client = bedrock.createClient({
    host: 'DEINE_SERVER_IP',   // z.B. play.meinserver.ch
    port: 19132,               // Standardport
    username: 'Botanak',       // Anzeigename im Spiel
    offline: true              // false, wenn Microsoft-Login benötigt wird
    // Wenn Online-Mode:
    // profilesFolder: './profiles',
    // username: 'Botanak.boteka@gmx.ch'
  });

  client.on('connect', () => {
    console.log('✅ Bot ist mit dem Minecraft-Server verbunden!');
  });

  client.on('disconnect', (reason) => {
    console.log('❌ Bot wurde getrennt:', reason);
    client = null;
  });

  client.on('error', (err) => {
    console.error('⚠️ Fehler:', err);
    client = null;
  });
}

function stopBot() {
  if (client) {
    console.log('Stoppe den Minecraft Bot...');
    client.disconnect();
    client = null;
  } else {
    console.log('Bot ist bereits gestoppt.');
  }
}

// ==============================
// Zeitsteuerung (Schweizer Zeit)
// ==============================

// Start um 14:00 Uhr
cron.schedule('0 14 * * *', () => {
  console.log('⏰ 14:00 - Bot wird gestartet');
  startBot();
}, {
  timezone: 'Europe/Zurich'
});

// Stop um 22:00 Uhr
cron.schedule('0 22 * * *', () => {
  console.log('⏰ 22:00 - Bot wird gestoppt');
  stopBot();
}, {
  timezone: 'Europe/Zurich'
});

// Beim Start prüfen, ob der Bot laufen soll
function isWithinActiveHours() {
  const now = new Date();
  const zurichTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'Europe/Zurich' })
  );
  const hour = zurichTime.getHours();
  return hour >= 14 && hour < 22;
}

if (isWithinActiveHours()) {
  startBot();
} else {
  console.log('Bot wartet auf die nächste Startzeit (14:00 Uhr).');
}