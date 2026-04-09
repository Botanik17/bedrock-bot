const bedrock = require('bedrock-protocol');
const express = require('express');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Minecraft Bedrock Bot läuft!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Webserver läuft auf Port ${PORT}`);
});

let client = null;

const SERVER_CONFIG = {
  host: 'pflaume.dat.gg',
  port: 17444,
  username: 'Botanak',
  offline: false,
  profilesFolder: './profiles'
};

function startBot() {
  if (client) {
    console.log('Bot läuft bereits.');
    return;
  }

  console.log('Starte den Minecraft Bedrock Bot...');

  try {
    client = bedrock.createClient(SERVER_CONFIG);

    client.on('connect', () => {
      console.log('✅ Verbunden!');
    });

    client.on('spawn', () => {
      console.log('🌍 Bot ist gespawnt!');
    });

    client.on('disconnect', (reason) => {
      console.log('❌ Getrennt:', reason);
      client = null;

      // 🔁 Auto-Restart nach 10 Sekunden
      setTimeout(startBot, 10000);
    });

    client.on('error', (err) => {
      console.error('⚠️ Fehler:', err);
      client = null;
    });

  } catch (error) {
    console.error('Start-Fehler:', error);
    client = null;
  }
}

function stopBot() {
  if (client) {
    console.log('Stoppe Bot...');
    try {
      client.disconnect();
    } catch (err) {
      console.error('Stop-Fehler:', err);
    }
    client = null;
  }
}

// ✅ Start um 14:00
cron.schedule('0 14 * * *', () => {
  console.log('⏰ 14:00 - Bot startet');
  startBot();
}, {
  timezone: 'Europe/Zurich'
});

// ✅ Stop um 22:00
cron.schedule('0 22 * * *', () => {
  console.log('⏰ 22:00 - Bot stoppt');
  stopBot();
}, {
  timezone: 'Europe/Zurich'
});

// Zeitcheck beim Start
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
  console.log('Bot startet sofort.');
  startBot();
} else {
  console.log('Bot wartet auf 14:00.');
}