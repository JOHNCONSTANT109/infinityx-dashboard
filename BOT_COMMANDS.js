/**
 * INFINITYX Dashboard Bot Commands
 *
 * These are the ACTUAL commands used by the bot (src/commands/dashboard.js).
 * The bot uses SHA-256 password hashing and stores accounts in the
 * 'dashboard_accounts' MongoDB collection — NOT in the 'users' collection.
 *
 * Collection: dashboard_accounts
 *   _id          : phone number digits (e.g. "2348012345678")
 *   botKey       : canonical WhatsApp key from keyOf(sender)
 *   passwordHash : SHA-256 hex of (password + salt)
 *   passwordSalt : 16-byte hex random salt
 *   createdAt    : Date.now()
 *   updatedAt    : Date.now() (on password reset)
 *
 * Commands (default prefix is whatever CONFIG.PREFIX is set to):
 *   {PREFIX}webpass [password]          — set dashboard password
 *   {PREFIX}addnumber [phonenumber]     — link phone number & create account
 *   {PREFIX}webresetpassword [password] — change existing password
 *
 * Dashboard URL: set DASHBOARD_URL env var on the bot, or edit below.
 */

import { randomBytes, createHash } from 'node:crypto';
import { mongo, keyOf } from '../src/lib/storage.js';
import { CONFIG } from '../src/config.js';

const dashCol = mongo.collection('dashboard_accounts');
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'https://infinityx-dashboard.onrender.com';

function hashPassword(password, salt) {
  return createHash('sha256').update(password + salt).digest('hex');
}

// ── webpass ─────────────────────────────────────────────────────────────────
export async function webpassCommand({ sock, msg, sender, args }) {
  const chatId = msg.key.remoteJid;
  const password = args.join(' ').trim();

  if (!password) {
    return sock.sendMessage(chatId, {
      text: `❌ Please provide a password.\nUsage: *${CONFIG.PREFIX}webpass [yourpassword]*\n_Password must be at least 6 characters._`,
    }, { quoted: msg });
  }
  if (password.length < 6) {
    return sock.sendMessage(chatId, {
      text: `❌ Password too short — must be at least *6 characters*.`,
    }, { quoted: msg });
  }

  const key = keyOf(sender);
  const salt = randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);

  await dashCol.updateOne(
    { botKey: key },
    { $set: { passwordHash: hash, passwordSalt: salt, updatedAt: Date.now() } },
    { upsert: true }
  );

  return sock.sendMessage(chatId, {
    text: `✅ *Password successfully set!*\n\n💡 Now use *${CONFIG.PREFIX}addnumber [yournumber]* to activate your dashboard account.\nExample: *${CONFIG.PREFIX}addnumber 2348012345678*`,
  }, { quoted: msg });
}

// ── addnumber ────────────────────────────────────────────────────────────────
export async function addnumberCommand({ sock, msg, sender, args }) {
  const chatId = msg.key.remoteJid;
  const number = (args[0] || '').replace(/\D/g, '');

  if (!number || number.length < 7) {
    return sock.sendMessage(chatId, {
      text: `❌ Please provide a valid phone number.\nUsage: *${CONFIG.PREFIX}addnumber [phonenumber]*\nExample: *${CONFIG.PREFIX}addnumber 2348012345678*`,
    }, { quoted: msg });
  }

  const key = keyOf(sender);
  const existing = await dashCol.findOne({ botKey: key });

  if (!existing?.passwordHash) {
    return sock.sendMessage(chatId, {
      text: `❌ You haven't set a password yet!\nPlease run *${CONFIG.PREFIX}webpass [yourpassword]* first.`,
    }, { quoted: msg });
  }

  const taken = await dashCol.findOne({ _id: number, botKey: { $ne: key } });
  if (taken) {
    return sock.sendMessage(chatId, {
      text: `❌ That phone number is already registered to another account.`,
    }, { quoted: msg });
  }

  await dashCol.deleteMany({ botKey: key });
  await dashCol.insertOne({
    _id: number,
    botKey: key,
    passwordHash: existing.passwordHash,
    passwordSalt: existing.passwordSalt,
    createdAt: Date.now(),
  });

  return sock.sendMessage(chatId, {
    text:
      `✅ *Dashboard created successfully!*\n\n` +
      `You can now log in with:\n` +
      `📱 *Number:* ${number}\n` +
      `🔑 *Password:* (the one you just set)\n\n` +
      `🔗 *Dashboard:* ${DASHBOARD_URL}\n\n` +
      `💡 Use *${CONFIG.PREFIX}webresetpassword [newpassword]* to change it anytime.`,
  }, { quoted: msg });
}

// ── webresetpassword ─────────────────────────────────────────────────────────
export async function webresetpasswordCommand({ sock, msg, sender, args }) {
  const chatId = msg.key.remoteJid;
  const password = args.join(' ').trim();

  if (!password) {
    return sock.sendMessage(chatId, {
      text: `❌ Please provide a new password.\nUsage: *${CONFIG.PREFIX}webresetpassword [newpassword]*`,
    }, { quoted: msg });
  }
  if (password.length < 6) {
    return sock.sendMessage(chatId, {
      text: `❌ Password too short — must be at least *6 characters*.`,
    }, { quoted: msg });
  }

  const key = keyOf(sender);
  const existing = await dashCol.findOne({ botKey: key });

  if (!existing?._id) {
    return sock.sendMessage(chatId, {
      text:
        `❌ No dashboard account found. Set one up first:\n` +
        `1️⃣ *${CONFIG.PREFIX}webpass [password]*\n` +
        `2️⃣ *${CONFIG.PREFIX}addnumber [yournumber]*`,
    }, { quoted: msg });
  }

  const salt = randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);

  await dashCol.updateOne(
    { _id: existing._id },
    { $set: { passwordHash: hash, passwordSalt: salt, updatedAt: Date.now() } }
  );

  return sock.sendMessage(chatId, {
    text: `✅ *Password updated successfully!*\n\n🔗 *Dashboard:* ${DASHBOARD_URL}`,
  }, { quoted: msg });
}
