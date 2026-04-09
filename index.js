// ==============================
// Module laden
// ==============================
const bedrock = require('bedrock-protocol');
const express = require('express');
const cron = require('node-cron');

// ==============================
// Webserver für Render
// ==============================
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Minecraft Bedrock Bot läuft!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Webserver läuft auf Port ${PORT}`);
});

// ==============================
// Minecraft Bedrock Bot
// ==============================
let client = null;

// 🔧 Server-Konfiguration
const SERVER_CONFIG = {
  host: 'pflaume.dat.gg',        // Deine Server-IP
  port: 17444,                   // Dein Server-Port
  username: 'Botanak',           // Anzeigename im Spiel
  offline: false,                // false = Microsoft/Xbox Login
  profilesFolder: './profiles'   // Speichert Login-Daten
};

// Bot starten
function startBot() {
  if (client) {
    console.log('Bot läuft bereits.');
    return;
  }

  console.log('Starte den Minecraft Bedrock Bot...');

  try {
    client = bedrock.createClient(SERVER_CONFIG);

    client.on('connect', () => {
      console.log('✅ Bot hat sich mit dem Minecraft-Server verbunden!');
    });

    client.on('join', () => {
      console.log('🎮 Bot ist dem Spiel beigetreten!');
    });

    client.on('spawn', () => {
      console.log('🌍 Bot ist gespawnt!');
    });

    client.on('disconnect', (reason) => {
      console.log('❌ Bot wurde getrennt:', reason);
      client = null;
    });

    client.on('error', (err) => {
      console.error('⚠️ Fehler:', err);
      client = null;
    });

  } catch (error) {
    console.error('Fehler beim Starten des Bots:', error);
    client = null;
  }
}

// Bot stoppen
function stopBot() {
  if (client) {
    console.log('Stoppe den Minecraft Bot...');
    try {
      client.disconnect();
    } catch (err) {
      console.error('Fehler beim Stoppen:', err);
    }
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
cron.schedule('0 23 * * *', () => {
  console.log('⏰ 23:00 - Bot wird gestoppt');
  stopBot();
}, {
  timezone: 'Europe/Zurich'
});

// Prüfen, ob der Bot beim Start laufen soll
function isWithinActiveHours() {
  const now = new Date();
  const zurichTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'Europe/Zurich' })
  );
  const hour = zurichTime.getHours();
  return hour >= 14 && hour < 22;
}

// Beim Start entscheiden
if (isWithinActiveHours()) {
  console.log('Bot startet sofort, da wir innerhalb der aktiven Zeit sind.');
  startBot();
} else {
  console.log('Bot wartet auf die nächste Startzeit um 14:00 Uhr.');
}