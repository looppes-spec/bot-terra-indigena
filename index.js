const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--no-first-run',
            '--no-zygote',
            '--single-process'
        ],
    }
});

const penalidades = {};

client.on('qr', (qr) => {
    console.log('Escaneie o código QR acima:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Monitoramento de Convites Online! 🌿');
});

client.on('message', async (msg) => {
    // FILTRO EXCLUSIVO: Só entra no IF se o link for convite de grupo do WhatsApp
    if (msg.body.includes('chat.whatsapp.com')) {
        const chat = await msg.getChat();
        
        if (chat.isGroup && !msg.fromMe) {
            const authorId = msg.author || msg.from;
            const participants = chat.participants;
            const botInGroup = participants.find(p => p.id._serialized === client.info.wid._serialized);

            if (botInGroup && botInGroup.isAdmin) {
                try {
                    // Apaga o link de convite
                    await msg.delete(true);
                    console.log(`Convite de grupo removido de: ${authorId}`);

                    if (!penalidades[authorId]) {
                        penalidades[authorId] = 0;
                    }
                    penalidades[authorId]++;

                    if (penalidades[authorId] < 3) {
                        await chat.sendMessage(`⚠️ @${authorId.split('@')[0]}, não é permitido enviar links de outros grupos aqui.\n\nAviso ${penalidades[authorId]}/3.`, {
                            mentions: [authorId]
                        });
                    } else {
                        await chat.sendMessage(`🚫 @${authorId.split('@')[0]} removido por insistência em convites externos.`, {
                            mentions: [authorId]
                        });
                        await chat.removeParticipants([authorId]);
                        delete penalidades[authorId];
                    }

                } catch (error) {
                    console.error('Erro ao processar penalidade:', error);
                }
            }
        }
    }
});

client.initialize();
