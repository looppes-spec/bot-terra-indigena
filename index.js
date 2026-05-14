const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// No plano pago, não precisamos forçar caminhos. O sistema se acha.
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        handleSIGTERM: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process'
        ],
    }
});

const penalidades = {};

client.on('qr', (qr) => {
    console.log('--- ESCANEIE O QR CODE NO LOG ABAIXO ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('SISTEMA TERRA INDÍGENA ONLINE E PROTEGIDO!');
});

client.on('message', async (msg) => {
    // Filtro cirúrgico para convites de outros grupos
    if (msg.body.includes('chat.whatsapp.com')) {
        const chat = await msg.getChat();
        
        if (chat.isGroup && !msg.fromMe) {
            const authorId = msg.author || msg.from;
            const participants = chat.participants;
            const botInGroup = participants.find(p => p.id._serialized === client.info.wid._serialized);

            if (botInGroup && botInGroup.isAdmin) {
                try {
                    await msg.delete(true);
                    
                    if (!penalidades[authorId]) penalidades[authorId] = 0;
                    penalidades[authorId]++;

                    if (penalidades[authorId] < 3) {
                        await chat.sendMessage(`⚠️ @${authorId.split('@')[0]}, não envie links de grupos. Aviso ${penalidades[authorId]}/3.`, {
                            mentions: [authorId]
                        });
                    } else {
                        await chat.sendMessage(`🚫 @${authorId.split('@')[0]} removido por excesso de convites.`, {
                            mentions: [authorId]
                        });
                        await chat.removeParticipants([authorId]);
                        delete penalidades[authorId];
                    }
                } catch (error) {
                    console.error('Erro na remoção:', error.message);
                }
            }
        }
    }
});

client.initialize();
