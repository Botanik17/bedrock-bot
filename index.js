const bedrock = require('bedrock-protocol');
const cron = require('node-cron');

let client = null;

const SERVER_CONFIG = {
  host: 'pflaume.dat.gg',
  port: 17444,
  username: 'Botanak',

  // ⚠️ WICHTIG: Auf Render meistens nötig
  offline: true,

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
      console.log('✅ Verbunden mit dem Server!');
    });

    client.on('spawn', () => {
      console.log('🌍 Bot ist gespawnt!');
    });

    client.on('disconnect', (reason) => {
      console.log('❌ Bot wurde getrennt:', reason);
      client = null;

      // 🔁 Auto-Reconnect nach 10 Sekunden
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
    console.log('Stoppe den Bot...');
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

// ✅ Start um 14:00 Uhr
cron.schedule('0 14 * * *', () => {
  console.log('⏰ 14:00 - Bot startet');
  startBot();
}, {
  timezone: 'Europe/Zurich'
});

// ✅ Stop um 22:00 Uhr
cron.schedule('0 22 * * *', () => {
  console.log('⏰ 22:00 - Bot stoppt');
  stopBot();
}, {
  timezone: 'Europe/Zurich'
});

// Prüfen ob wir aktuell in der aktiven Zeit sind
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
  console.log('Bot wartet auf 14:00 Uhr.');
}