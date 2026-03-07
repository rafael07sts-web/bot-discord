require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");

// ===== HTTP SERVER FOR RENDER (DO NOT REMOVE) =====
const http = require("http");
const PORT = process.env.PORT || 10000;

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Bot is online!");
  })
  .listen(PORT, () => console.log("HTTP running on port", PORT));
// ==================================================

// ===== Anti-sleep (helps on Render free) =====
setInterval(() => {
  console.log("Keeping the bot awake...");
}, 280000);
// ============================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const PREFIX = ".";

// ===== ROLE IDS =====
const MEMBER_ROLE_ID = "1215810801680519219";
const EA_ROLE_ID = "1209846373239885854";
const VS_ROLE_ID = "1209847709557858334";
const VIP_ROLE_ID = "1392629229727780974";
// ====================

function makeEmbed(type, title, description) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();

  if (type === "ok") embed.setColor(0x2ecc71);
  if (type === "err") embed.setColor(0xe74c3c);
  if (type === "info") embed.setColor(0x3498db);

  return { embeds: [embed] };
}

const ok = (text) => makeEmbed("ok", "✅ Success", text);
const err = (text) => makeEmbed("err", "❌ Error", text);
const info = (text) => makeEmbed("info", "ℹ️ Info", text);

function botMember(guild) {
  return guild.members.me || guild.members.cache.get(client.user.id);
}

function roleById(guild, roleId) {
  return guild.roles.cache.get(roleId) || null;
}

function botCanManageRole(guild, role) {
  const me = botMember(guild);
  if (!me) return false;
  return me.roles.highest.position > role.position;
}

client.once("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = (args.shift() || "").toLowerCase();

  const canManageRoles = message.member.permissions.has(PermissionsBitField.Flags.ManageRoles);
  const canManageMessages = message.member.permissions.has(PermissionsBitField.Flags.ManageMessages);
  const canBan = message.member.permissions.has(PermissionsBitField.Flags.BanMembers);
  const canManageChannels = message.member.permissions.has(PermissionsBitField.Flags.ManageChannels);

  // =========================
  // !help
  // =========================
  if (command === "help") {
    const text = [
      `**${PREFIX}member @user Name** → Set RZ nickname and add MEMBER role`,
      `**${PREFIX}ea @user Name** → Set EA nickname and add EA role`,
      `**${PREFIX}vip @user** → Add VIP role`,
      `**${PREFIX}vs @user1 @user2 ...** → Add VS role to mentioned users`,
      `**${PREFIX}vsrm @user1 @user2 ...** → Remove VS role from mentioned users`,
      `**${PREFIX}vsrall** → Remove VS role from everyone who has it`,
      `**${PREFIX}ban @user [reason]** → Ban a user`,
      `**${PREFIX}unban <userId> [reason]** → Unban a user by ID`,
      `**${PREFIX}lock** → Lock the current channel`,
      `**${PREFIX}unlock** → Unlock the current channel`,
      `**${PREFIX}purge 1-100** → Delete recent messages in the current channel`,
    ].join("\n");

    return message.reply(info(text));
  }

  // =========================
  // !member @user Name
  // =========================
  if (command === "member") {
    if (!canManageRoles) return message.reply(err("You don't have permission (Manage Roles)."));

    const member = message.mentions.members.first();
    if (!member) return message.reply(err("Usage: `!member @user Name`"));

    const newName = args.slice(1).join(" ");
    if (!newName) {
      return message.reply(err("Please provide a name after the mention. Example: `!member @user Rafael`"));
    }

    const role = roleById(message.guild, MEMBER_ROLE_ID);
    if (!role) return message.reply(err("MEMBER role not found. Check MEMBER_ROLE_ID."));

    if (!botCanManageRole(message.guild, role)) {
      return message.reply(err("My role must be ABOVE the MEMBER role in the server hierarchy."));
    }

    try {
      await member.setNickname(`𝗥𝗭 • ${newName} あ`);
      await member.roles.add(role);

      return message.reply(
        ok(`Set to **MEMBER**:\n👤 ${member.user.tag}\n🏷️ Nickname: **𝗥𝗭 • ${newName} あ**`)
      );
    } catch (e) {
      console.error(e);
      return message.reply(err("I couldn't change nickname or add the role. Check permissions and hierarchy."));
    }
  }

  // =========================
  // !ea @user Name
  // =========================
  if (command === "ea") {
    if (!canManageRoles) return message.reply(err("You don't have permission (Manage Roles)."));

    const member = message.mentions.members.first();
    if (!member) return message.reply(err("Usage: `!ea @user Name`"));

    const newName = args.slice(1).join(" ");
    if (!newName) {
      return message.reply(err("Please provide a name after the mention. Example: `!ea @user Rafael`"));
    }

    const role = roleById(message.guild, EA_ROLE_ID);
    if (!role) return message.reply(err("EA role not found. Check EA_ROLE_ID."));

    if (!botCanManageRole(message.guild, role)) {
      return message.reply(err("My role must be ABOVE the EA role in the server hierarchy."));
    }

    try {
      await member.setNickname(`𝗘𝗔 • ${newName} ✰`);
      await member.roles.add(role);

      return message.reply(
        ok(`Set to **EA**:\n👤 ${member.user.tag}\n🏷️ Nickname: **𝗘𝗔 • ${newName} ✰**`)
      );
    } catch (e) {
      console.error(e);
      return message.reply(err("I couldn't change nickname or add the role. Check permissions and hierarchy."));
    }
  }

  // =========================
  // !vip @user
  // =========================
  if (command === "vip") {
    if (!canManageRoles) return message.reply(err("You don't have permission (Manage Roles)."));

    const member = message.mentions.members.first();
    if (!member) return message.reply(err("Usage: `!vip @user`"));

    const role = roleById(message.guild, VIP_ROLE_ID);
    if (!role) return message.reply(err("VIP role not found. Check VIP_ROLE_ID."));

    if (!botCanManageRole(message.guild, role)) {
      return message.reply(err("My role must be ABOVE the VIP role in the server hierarchy."));
    }

    try {
      await member.roles.add(role);
      return message.reply(ok(`VIP role added to **${member.user.tag}**.`));
    } catch (e) {
      console.error(e);
      return message.reply(err("I couldn't add the VIP role. Check permissions and hierarchy."));
    }
  }

  // =========================
  // !vs @user1 @user2 ...
  // =========================
  if (command === "vs") {
    if (!canManageRoles) return message.reply(err("You don't have permission (Manage Roles)."));

    const members = message.mentions.members;
    if (!members.size) return message.reply(err("Usage: `!vs @user1 @user2 ...`"));

    const role = roleById(message.guild, VS_ROLE_ID);
    if (!role) return message.reply(err("VS role not found. Check VS_ROLE_ID."));

    if (!botCanManageRole(message.guild, role)) {
      return message.reply(err("My role must be ABOVE the VS role in the server hierarchy."));
    }

    let okCount = 0;
    let failCount = 0;

    for (const m of members.values()) {
      try {
        await m.roles.add(role);
        okCount++;
      } catch {
        failCount++;
      }
    }

    return message.reply(
      ok(`VS role added.\n✅ Success: **${okCount}**\n❌ Failed: **${failCount}**`)
    );
  }

  // =========================
  // !vsrm @user1 @user2 ...
  // =========================
  if (command === "vsrm") {
    if (!canManageRoles) return message.reply(err("You don't have permission (Manage Roles)."));

    const members = message.mentions.members;
    if (!members.size) return message.reply(err("Usage: `!vsrm @user1 @user2 ...`"));

    const role = roleById(message.guild, VS_ROLE_ID);
    if (!role) return message.reply(err("VS role not found. Check VS_ROLE_ID."));

    if (!botCanManageRole(message.guild, role)) {
      return message.reply(err("My role must be ABOVE the VS role in the server hierarchy."));
    }

    let okCount = 0;
    let failCount = 0;

    for (const m of members.values()) {
      try {
        await m.roles.remove(role);
        okCount++;
      } catch {
        failCount++;
      }
    }

    return message.reply(
      ok(`VS role removed.\n✅ Success: **${okCount}**\n❌ Failed: **${failCount}**`)
    );
  }

  // =========================
  // !vsrall
  // =========================
  if (command === "vsrall") {
    if (!canManageRoles) return message.reply(err("You don't have permission (Manage Roles)."));

    const role = roleById(message.guild, VS_ROLE_ID);
    if (!role) return message.reply(err("VS role not found. Check VS_ROLE_ID."));

    if (!botCanManageRole(message.guild, role)) {
      return message.reply(err("My role must be ABOVE the VS role in the server hierarchy."));
    }

    await message.guild.members.fetch().catch(() => null);

    const membersWithVS = role.members;
    if (!membersWithVS.size) return message.reply(info("No one currently has the VS role."));

    let okCount = 0;
    let failCount = 0;

    for (const m of membersWithVS.values()) {
      try {
        await m.roles.remove(role);
        okCount++;
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch {
        failCount++;
      }
    }

    return message.reply(
      ok(`Mass VS removal complete.\n✅ Removed: **${okCount}**\n❌ Failed: **${failCount}**`)
    );
  }

  // =========================
  // !ban @user [reason]
  // =========================
  if (command === "ban") {
    if (!canBan) return message.reply(err("You don't have permission (Ban Members)."));

    const member = message.mentions.members.first();
    if (!member) return message.reply(err("Usage: `!ban @user [reason]`"));

    const reason = args.slice(1).join(" ") || "No reason provided";

    if (!member.bannable) {
      return message.reply(err("I can't ban this user. They may have a higher role, or I may lack permissions."));
    }

    try {
      await member.ban({ reason });
      return message.reply(ok(`Banned: **${member.user.tag}**\n📝 Reason: **${reason}**`));
    } catch (e) {
      console.error(e);
      return message.reply(err("Ban failed. Check my permissions and role hierarchy."));
    }
  }

  // =========================
  // !unban <userId> [reason]
  // =========================
  if (command === "unban") {
    if (!canBan) return message.reply(err("You don't have permission (Ban Members)."));

    const userId = args[0];
    if (!userId) return message.reply(err("Usage: `!unban <userId> [reason]`"));

    const reason = args.slice(1).join(" ") || "No reason provided";

    try {
      await message.guild.bans.fetch(userId);
      await message.guild.bans.remove(userId, reason);

      return message.reply(ok(`Unbanned: **${userId}**\n📝 Reason: **${reason}**`));
    } catch (e) {
      console.error(e);
      return message.reply(err("Unban failed. Make sure the ID is correct and the user is banned."));
    }
  }

  // =========================
  // !lock
  // =========================
  if (command === "lock") {
    if (!canManageChannels) return message.reply(err("You don't have permission (Manage Channels)."));

    try {
      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        { SendMessages: false }
      );

      return message.reply(ok("🔒 Channel locked."));
    } catch (e) {
      console.error(e);
      return message.reply(err("Failed to lock this channel."));
    }
  }

  // =========================
  // !unlock
  // =========================
  if (command === "unlock") {
    if (!canManageChannels) return message.reply(err("You don't have permission (Manage Channels)."));

    try {
      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        { SendMessages: true }
      );

      return message.reply(ok("🔓 Channel unlocked."));
    } catch (e) {
      console.error(e);
      return message.reply(err("Failed to unlock this channel."));
    }
  }

  // =========================
  // !purge 1-100
  // =========================
  if (command === "purge") {
    if (!canManageMessages) return message.reply(err("You don't have permission (Manage Messages)."));

    const amount = parseInt(args[0], 10);
    if (!amount || amount < 1 || amount > 100) {
      return message.reply(err("Usage: `!purge 1-100` (example: `!purge 50`)"));
    }

    try {
      await message.delete().catch(() => null);

      const deleted = await message.channel.bulkDelete(amount, true);

      const replyMessage = await message.channel.send(
        ok(`🧹 Deleted **${deleted.size}** messages.`)
      );

      setTimeout(() => {
        replyMessage.delete().catch(() => null);
      }, 5000);

      return;
    } catch (e) {
      console.error(e);
      return message.reply(err("Purge failed. Messages older than 14 days cannot be bulk deleted."));
    }
  }
});

client.login(process.env.TOKEN);