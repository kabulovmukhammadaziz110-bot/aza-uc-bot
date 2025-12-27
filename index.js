const { Telegraf, Markup } = require("telegraf");

// ====== MA'LUMOTLARING ======
const BOT_TOKEN = "7997422995:AAFJdKTWfdIux59a9QfM5DnbxOCUwMJ_mQ8";
const ADMIN_ID = 7206819525;

const UZCARD = "5614 6868 1392 9406";
const HUMO = "9860 3566 2258 3546";

// UC narxlari
const ucPrices = {
  "60 UC": "11 500",
  "120 UC": "25 000",
  "180 UC": "38 000",
  "325 UC": "58 000",
  "385 UC": "72 000",
  "660 UC": "115 000",
  "720 UC": "129 000",
  "985 UC": "177 000",
  "1320 UC": "234 000",
  "1800 UC": "300 000",
};

const bot = new Telegraf(BOT_TOKEN);

// vaqtinchalik xotira
const users = {};
const blocked = new Set();

// ====== /start ======
bot.start((ctx) => {
  if (blocked.has(ctx.from.id)) {
    return ctx.reply("🚫 Siz bloklangansiz.");
  }

  ctx.reply(
    "🎮 *Aza UC bot*\n\nBuyurtma berish uchun tanlang:",
    {
      parse_mode: "Markdown",
      ...Markup.keyboard([
        ["🎮 UC sotib olish"],
        ["💰 Narxlar"]
      ]).resize()
    }
  );
});

// ====== Narxlar ======
bot.hears("💰 Narxlar", (ctx) => {
  let text = "💰 *UC narxlari:*\n\n";
  for (let uc in ucPrices) {
    text += `💵 ${uc} — ${ucPrices[uc]} so‘m\n`;
  }
  ctx.reply(text, { parse_mode: "Markdown" });
});

// ====== Buyurtma boshlash ======
bot.hears("🎮 UC sotib olish", (ctx) => {
  users[ctx.from.id] = {};
  ctx.reply("🆔 PUBG ID yuboring (faqat raqam):");
});

// ====== PUBG ID ======
bot.hears(/^\d+$/, (ctx) => {
  const uid = ctx.from.id;
  if (!users[uid]) return;

  users[uid].pubgId = ctx.message.text;

  const buttons = Object.entries(ucPrices).map(
    ([uc, price]) => [`💵 ${uc} - ${price}`]
  );

  ctx.reply(
    "📦 UC miqdorini tanlang:",
    Markup.keyboard(buttons).resize()
  );
});

// ====== UC tanlash ======
bot.hears(/^💵/, async (ctx) => {
  const uid = ctx.from.id;
  if (!users[uid]) return;

  users[uid].uc = ctx.message.text;

  // admin tugmalari
  await bot.telegram.sendMessage(
    ADMIN_ID,
    `🆕 *YANGI BUYURTMA*\n\n👤 @${ctx.from.username || "username yo‘q"}\n🆔 PUBG ID: ${users[uid].pubgId}\n📦 ${users[uid].uc}`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        Markup.button.callback("✅ Tasdiqlash", `ok_${uid}`),
        Markup.button.callback("🚫 Bloklash", `block_${uid}`)
      ])
    }
  );

  ctx.reply(
    `✅ Buyurtma qabul qilindi!\n\n💳 To‘lov:\nUzcard: ${UZCARD}\nHumo: ${HUMO}\n\n📸 Screenshot yuboring`
  );
});

// ====== Screenshot ======
bot.on("photo", async (ctx) => {
  const uid = ctx.from.id;
  if (!users[uid]) return;

  await ctx.telegram.sendPhoto(
    ADMIN_ID,
    ctx.message.photo.pop().file_id,
    {
      caption: `📸 TO‘LOV\n👤 @${ctx.from.username || "yo‘q"}\n🆔 ${users[uid].pubgId}\n📦 ${users[uid].uc}`
    }
  );

  ctx.reply("✅ Screenshot qabul qilindi");
});

// ====== Admin callback ======
bot.action(/ok_(\d+)/, async (ctx) => {
  const uid = ctx.match[1];
  await bot.telegram.sendMessage(uid, "✅ UC muvaffaqiyatli tushdi!");
  await ctx.editMessageReplyMarkup();
});

bot.action(/block_(\d+)/, async (ctx) => {
  const uid = ctx.match[1];
  blocked.add(Number(uid));
  await ctx.editMessageReplyMarkup();
  ctx.reply("🚫 User bloklandi");
});

// ====== BOTNI ISHGA TUSHIRISH ======
bot.launch();
console.log("🤖 Bot ishga tushdi");