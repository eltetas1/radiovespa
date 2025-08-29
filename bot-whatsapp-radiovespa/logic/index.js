// logic/index.js
import * as Baileys from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import Pino from 'pino';
import db from '../sql/db.js';
import db, { q } from "../sql/db.js";

// dentro de startBot(), antes de crear/usar el socket:
try {
  await db.query('SELECT 1');
  console.log('✅ DB OK');
} catch (e) {
  console.error('❌ DB FAIL. Revisa .env (DATABASE_URL o PG_*). Detalle:', e.message);
  process.exit(1);
}

// Detecta la forma correcta de obtener makeWASocket según la versión
const make =
  typeof Baileys?.default === 'function'
    ? Baileys.default
    : (typeof Baileys?.makeWASocket === 'function' ? Baileys.makeWASocket : null);

if (!make) {
  console.error('❌ No se pudo localizar makeWASocket en @whiskeysockets/baileys');
  console.error('Claves exportadas:', Object.keys(Baileys));
  process.exit(1);
}

const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = Baileys;

import db, { q } from "../sql/db.js"; // asegúrate de importar q

async function startBot() {
  // Test de conexión rápido
  try {
    await q('SELECT 1');
    console.log('✅ DB OK');
  } catch (e) {
    console.error('❌ DB FAIL. Revisa .env (DATABASE_URL o PG_*). Detalle:', e.message);
    process.exit(1);
  }

  // ... luego sigues con useMultiFileAuthState/makeWASocket/etc.
}



async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const { version } = await fetchLatestBaileysVersion();

  const sock = make({
    auth: state,
    version,
    logger: Pino({ level: 'silent' }),
    // No uses printQRInTerminal: está deprecado
    syncFullHistory: false,
    browser: ['Ubuntu', 'Chrome', '120.0.0.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  // Mostrar QR en terminal
  sock.ev.on('connection.update', (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      console.log('📲 Escanea este QR con WhatsApp:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      console.log('✅ Bot conectado a WhatsApp');
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error?.output?.statusCode) !== DisconnectReason.loggedOut;
      console.log('❌ Conexión cerrada. ¿Reconectar?', shouldReconnect);
      if (shouldReconnect) startBot();
    }
  });

  // Escuchar mensajes entrantes
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;

    const chatId = msg.key.remoteJid;
    const texto =
      msg.message.conversation?.trim()
      || msg.message.extendedTextMessage?.text?.trim()
      || '';

    if (texto.startsWith('/solicitar')) {
      const partes = texto.split(/\s+/);
      const vespaId = parseInt(partes[1], 10);

      if (Number.isNaN(vespaId)) {
        await sock.sendMessage(chatId, { text: '❌ Uso: /solicitar <id_vespa>' });
        return;
      }

      // Guarda clic
      await db.query(
        'INSERT INTO clics (vespa_id, telefono_cliente, fecha) VALUES ($1, $2, NOW())',
        [vespaId, chatId]
      );

      // Busca teléfono del transportista
      const res = await db.query('SELECT telefono FROM vespas WHERE id = $1', [vespaId]);
      if (res.rowCount === 0) {
        await sock.sendMessage(chatId, { text: '❌ No encontré esa Vespa.' });
        return;
      }

      const telefono = res.rows[0].telefono.replace(/\D/g, '');
      await sock.sendMessage(chatId, { text: '✅ Te pasamos con el transportista.' });

      await sock.sendMessage(`${telefono}@s.whatsapp.net`, {
        text: `🚚 Nueva solicitud de ${chatId} para la VESPA #${vespaId}`,
      });
    }
  });
}

startBot().catch((e) => {
  console.error('❌ Error al iniciar el bot:', e);
  process.exit(1);
});
