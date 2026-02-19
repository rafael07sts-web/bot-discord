require('dotenv').config();
// ===== SERVIDOR HTTP PARA RENDER (NÃO REMOVER) =====
const http = require("http");
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot está online!");
}).listen(PORT, () => {
  console.log("HTTP ativo na porta", PORT);
});
// ====================================================

const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const PREFIX = "!";

// ✅ seus IDs
const MEMBER_ROLE_ID = "1215810801680519219";
const EA_ROLE_ID = "1209846373239885854";
const VS_ROLE_ID = "1209847709557858334";

client.once("ready", () => {
  console.log(`Bot online como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  // Permissão mínima pros comandos de cargo/nick
  const temPerm = message.member?.permissions.has(PermissionsBitField.Flags.ManageRoles);

  // 🔹 !member @user Nome
  if (command === "member") {
    if (!temPerm) return message.reply("Sem permissão.");
    const membro = message.mentions.members.first();
    if (!membro) return message.reply("Mencione um usuário.");

    const novoNome = args.slice(1).join(" ");
    if (!novoNome) return message.reply("Digite o novo nome após mencionar.");

    try {
      await membro.setNickname(`𝗥𝗭 • ${novoNome} あ`);
      await membro.roles.add(MEMBER_ROLE_ID);
      return message.reply("Usuário configurado como MEMBER.");
    } catch (e) {
      return message.reply("Erro ao configurar (verifique hierarquia/permissões).");
    }
  }

  // 🔹 !ea @user Nome
  if (command === "ea") {
    if (!temPerm) return message.reply("Sem permissão.");
    const membro = message.mentions.members.first();
    if (!membro) return message.reply("Mencione um usuário.");

    const novoNome = args.slice(1).join(" ");
    if (!novoNome) return message.reply("Digite o novo nome após mencionar.");

    try {
      await membro.setNickname(`𝗘𝗔 • ${novoNome} ✰`);
      await membro.roles.add(EA_ROLE_ID);
      return message.reply("Usuário configurado como EA.");
    } catch (e) {
      return message.reply("Erro ao configurar (verifique hierarquia/permissões).");
    }
  }

  // 🔹 !vs @user1 @user2 ...
  if (command === "vs") {
    if (!temPerm) return message.reply("Sem permissão.");
    const membros = message.mentions.members;
    if (!membros.size) return message.reply("Mencione usuários.");

    try {
      for (const m of membros.values()) {
        await m.roles.add(VS_ROLE_ID);
      }
      return message.reply("Cargo VS adicionado.");
    } catch (e) {
      return message.reply("Erro ao adicionar cargo (verifique hierarquia/permissões).");
    }
  }

  // 🔹 !vsrm @user1 @user2 ...
  if (command === "vsrm") {
    if (!temPerm) return message.reply("Sem permissão.");
    const membros = message.mentions.members;
    if (!membros.size) return message.reply("Mencione usuários.");

    try {
      for (const m of membros.values()) {
        await m.roles.remove(VS_ROLE_ID);
      }
      return message.reply("Cargo VS removido.");
    } catch (e) {
      return message.reply("Erro ao remover cargo (verifique hierarquia/permissões).");
    }
  }
});

client.login(process.env.TOKEN);
