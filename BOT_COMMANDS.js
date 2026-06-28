/**
 * INFINITYX Dashboard Bot Commands
 * 
 * Add these commands to your bot's command handler.
 * This uses bcryptjs for password hashing — install it with:
 *   npm install bcryptjs
 * 
 * These commands expect your bot to have access to the same MongoDB database
 * that the dashboard uses (set via MONGODB_URI in the dashboard's .env.local)
 */

const bcrypt = require("bcryptjs");

// ─────────────────────────────────────────────
// CONFIGURATION — edit these to match your bot
// ─────────────────────────────────────────────

const WEBSITE_URL = "https://your-site.vercel.app"; // ← Change this to your deployed Vercel URL
const MIN_PASSWORD_LENGTH = 6;

// ─────────────────────────────────────────────
// HELPER: get user from DB by WhatsApp JID/number
// ─────────────────────────────────────────────

async function getUserFromDB(db, sender) {
  const cleanNumber = sender.replace("@s.whatsapp.net", "").replace(/\D/g, "");
  return await db.collection("users").findOne({
    $or: [
      { number: cleanNumber },
      { number: `${cleanNumber}@s.whatsapp.net` },
      { jid: `${cleanNumber}@s.whatsapp.net` },
      { id: cleanNumber },
    ],
  });
}

// ─────────────────────────────────────────────
// COMMAND: !webpass [password]
// Sets a web password for the dashboard
// ─────────────────────────────────────────────

async function handleWebpass(sock, msg, sender, args, db) {
  const password = args[0];

  if (!password) {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: `❌ Please provide a password.\n\nUsage: *!webpass yourpassword*\nMinimum ${MIN_PASSWORD_LENGTH} characters.`,
    });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: `❌ Password too short!\nMinimum *${MIN_PASSWORD_LENGTH} characters* required.`,
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const cleanNumber = sender.replace("@s.whatsapp.net", "").replace(/\D/g, "");

    await db.collection("users").updateOne(
      {
        $or: [
          { number: cleanNumber },
          { number: `${cleanNumber}@s.whatsapp.net` },
          { jid: sender },
          { id: cleanNumber },
        ],
      },
      { $set: { webPassword: hashedPassword } },
      { upsert: false }
    );

    await sock.sendMessage(msg.key.remoteJid, {
      text: `✅ *Password successfully set!*\n\nYou can now use *!addnumber* to register your dashboard access.`,
    });
  } catch (err) {
    console.error("webpass error:", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: `❌ Error setting password. Please try again.`,
    });
  }
}

// ─────────────────────────────────────────────
// COMMAND: !addnumber [number]
// Registers a phone number to the dashboard
// ─────────────────────────────────────────────

async function handleAddNumber(sock, msg, sender, args, db) {
  const inputNumber = args[0];

  if (!inputNumber) {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: `❌ Please provide your phone number.\n\nUsage: *!addnumber 27XXXXXXXXX*\nUse full international format without +`,
    });
  }

  const cleanNumber = inputNumber.replace(/\D/g, "");

  if (cleanNumber.length < 10) {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: `❌ Invalid number format.\nUse your full number, e.g. *27XXXXXXXXX*`,
    });
  }

  try {
    const user = await getUserFromDB(db, sender);

    if (!user) {
      return await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ You don't have a game account yet. Start playing first!`,
      });
    }

    if (!user.webPassword) {
      return await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ You need to set a password first!\n\nUse: *!webpass yourpassword*`,
      });
    }

    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { dashboardNumber: cleanNumber, number: cleanNumber } }
    );

    const username = user.name || user.username || user.pushName || `Player_${cleanNumber.slice(-4)}`;

    await sock.sendMessage(msg.key.remoteJid, {
      text: `✅ *Dashboard created successfully!*\n\nYou can now log in with:\n📱 *Number:* ${cleanNumber}\n🔑 *Password:* (the one you set with !webpass)\n\n🔗 *Dashboard:* ${WEBSITE_URL}\n\n💡 Use *!webresetpassword [newpassword]* to change it anytime.`,
    });
  } catch (err) {
    console.error("addnumber error:", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: `❌ Error registering dashboard. Please try again.`,
    });
  }
}

// ─────────────────────────────────────────────
// COMMAND: !webresetpassword [newpassword]
// Resets the web dashboard password
// ─────────────────────────────────────────────

async function handleWebResetPassword(sock, msg, sender, args, db) {
  const newPassword = args[0];

  if (!newPassword) {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: `❌ Please provide a new password.\n\nUsage: *!webresetpassword yournewpassword*`,
    });
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: `❌ Password too short! Minimum *${MIN_PASSWORD_LENGTH} characters* required.`,
    });
  }

  try {
    const user = await getUserFromDB(db, sender);

    if (!user) {
      return await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ Account not found.`,
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { webPassword: hashedPassword } }
    );

    await sock.sendMessage(msg.key.remoteJid, {
      text: `✅ *Password reset successfully!*\n\n🔗 Log in at: ${WEBSITE_URL}`,
    });
  } catch (err) {
    console.error("webresetpassword error:", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: `❌ Error resetting password. Please try again.`,
    });
  }
}

// ─────────────────────────────────────────────
// USAGE: integrate into your bot's message handler
// ─────────────────────────────────────────────
//
// In your message handler:
//
//   const [command, ...args] = body.split(" ");
//   switch (command.toLowerCase()) {
//     case "!webpass":
//       await handleWebpass(sock, msg, sender, args, db);
//       break;
//     case "!addnumber":
//       await handleAddNumber(sock, msg, sender, args, db);
//       break;
//     case "!webresetpassword":
//       await handleWebResetPassword(sock, msg, sender, args, db);
//       break;
//   }

module.exports = { handleWebpass, handleAddNumber, handleWebResetPassword };
