require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");

const http = require("http");
const PORT = process.env.PORT || 10000;

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Bot is online!");
  })
  .listen(PORT, () => console.log("HTTP running on port", PORT));

setInterval(() => {
  console.log("Keeping the bot awake...");
}, 280000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

client.on("error", (error) => {
  console.error("Discord client error:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

const PREFIX = ".";

const MEMBER_ROLE_ID = "1215810801680519219";
const EA_ROLE_ID = "1209846373239885854";
const VS_ROLE_ID = "1209847709557858334";

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

client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = (args.shift() || "").toLowerCase();

  const canManageRoles = message.member.permissions.has(
    PermissionsBitField.Flags.ManageRoles
  );

  // .member @user Name
  if (command === "member") {
    if (!canManageRoles) {
      return message.reply(err("You don't have permission (Manage Roles)."));
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply(err("Usage: `.member @user Name`"));
    }

    const newName = args.slice(1).join(" ");
    if (!newName) {
      return message.reply(
        err("Please provide a name after the mention. Example: `.member @user Rafael`")
      );
    }

    const role = roleById(message.guild, MEMBER_ROLE_ID);
    if (!role) {
      return message.reply(err("MEMBER role not found. Check MEMBER_ROLE_ID."));
    }

    if (!botCanManageRole(message.guild, role)) {
      return message.reply(
        err("My role must be ABOVE the MEMBER role in the server hierarchy.")
      );
    }

    try {
      await member.setNickname(`𝗥𝗭 • ${newName} あ`);
      await member.roles.add(role);

      return message.reply(
        ok(`Set to **MEMBER**:\n👤 ${member.user.tag}\n🏷️ Nickname: **𝗥𝗭 • ${newName} あ**`)
      );
    } catch (e) {
      console.error(e);
      return message.reply(
        err("I couldn't change nickname or add the role. Check permissions and hierarchy.")
      );
    }
  }

  // .ea @user Name
  if (command === "ea") {
    if (!canManageRoles) {
      return message.reply(err("You don't have permission (Manage Roles)."));
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply(err("Usage: `.ea @user Name`"));
    }

    const newName = args.slice(1).join(" ");
    if (!newName) {
      return message.reply(
        err("Please provide a name after the mention. Example: `.ea @user Rafael`")
      );
    }

    const role = roleById(message.guild, EA_ROLE_ID);
    if (!role) {
      return message.reply(err("EA role not found. Check EA_ROLE_ID."));
    }

    if (!botCanManageRole(message.guild, role)) {
      return message.reply(
        err("My role must be ABOVE the EA role in the server hierarchy.")
      );
    }

    try {
      await member.setNickname(`𝗘𝗔 • ${newName} ✰`);
      await member.roles.add(role);

      return message.reply(
        ok(`Set to **EA**:\n👤 ${member.user.tag}\n🏷️ Nickname: **𝗘𝗔 • ${newName} ✰**`)
      );
    } catch (e) {
      console.error(e);
      return message.reply(
        err("I couldn't change nickname or add the role. Check permissions and hierarchy.")
      );
    }
  }

  // .vs @user1 @user2 ...
  if (command === "vs") {
    if (!canManageRoles) {
      return message.reply(err("You don't have permission (Manage Roles)."));
    }

    const members = message.mentions.members;
    if (!members.size) {
      return message.reply(err("Usage: `.vs @user1 @user2 ...`"));
    }

    const role = roleById(message.guild, VS_ROLE_ID);
    if (!role) {
      return message.reply(err("VS role not found. Check VS_ROLE_ID."));
    }

    if (!botCanManageRole(message.guild, role)) {
      return message.reply(
        err("My role must be ABOVE the VS role in the server hierarchy.")
      );
    }

    let okCount = 0;
    let failCount = 0;

    for (const member of members.values()) {
      try {
        await member.roles.add(role);
        okCount++;
      } catch {
        failCount++;
      }
    }

    return message.reply(
      ok(`VS role added.\n✅ Success: **${okCount}**\n❌ Failed: **${failCount}**`)
    );
  }

  // .vsrm @user1 @user2 ...
  if (command === "vsrm") {
    if (!canManageRoles) {
      return message.reply(err("You don't have permission (Manage Roles)."));
    }

    const members = message.mentions.members;
    if (!members.size) {
      return message.reply(err("Usage: `.vsrm @user1 @user2 ...`"));
    }

    const role = roleById(message.guild, VS_ROLE_ID);
    if (!role) {
      return message.reply(err("VS role not found. Check VS_ROLE_ID."));
    }

    if (!botCanManageRole(message.guild, role)) {
      return message.reply(
        err("My role must be ABOVE the VS role in the server hierarchy.")
      );
    }

    let okCount = 0;
    let failCount = 0;

    for (const member of members.values()) {
      try {
        await member.roles.remove(role);
        okCount++;
      } catch {
        failCount++;
      }
    }

    return message.reply(
      ok(`VS role removed.\n✅ Success: **${okCount}**\n❌ Failed: **${failCount}**`)
    );
  }

  // .vsrall
  if (command === "vsrall") {
    if (!canManageRoles) {
      return message.reply(err("You don't have permission (Manage Roles)."));
    }

    const role = roleById(message.guild, VS_ROLE_ID);
    if (!role) {
      return message.reply(err("VS role not found. Check VS_ROLE_ID."));
    }

    if (!botCanManageRole(message.guild, role)) {
      return message.reply(
        err("My role must be ABOVE the VS role in the server hierarchy.")
      );
    }

    await message.guild.members.fetch().catch(() => null);

    const membersWithVS = role.members;
    if (!membersWithVS.size) {
      return message.reply(info("No one currently has the VS role."));
    }

    let okCount = 0;
    let failCount = 0;

    for (const member of membersWithVS.values()) {
      try {
        await member.roles.remove(role);
        okCount++;
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch {
        failCount++;
      }
    }

    return message.reply(
      ok(
        `Mass VS removal complete.\n✅ Removed: **${okCount}**\n❌ Failed: **${failCount}**`
      )
    );
  }
});

console.log("Starting Discord login...");
console.log("TOKEN exists:", !!process.env.TOKEN);
console.log("TOKEN length:", process.env.TOKEN?.length);

client.login(process.env.TOKEN)
  .then(() => {
    console.log("Login request sent successfully.");
  })
  .catch((error) => {
    console.error("Login failed:", error);
  });