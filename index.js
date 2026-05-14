const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        handleSIGTERM: false,
        executablePath: '/usr/bin/google-chrome-stable', // Caminho padrão do plano Starter
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process',
            '--no-zygote'
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
    if (msg.body.includes('chat.whatsapp.com')) {
        const chat = await msg.getChat();
        if (chat.isGroup && !msg.fromMe) {
            const authorId = msg.author || msg.from;
            try {
                await msg.delete(true);
                if (!penalidades[authorId]) penalidades[authorId] = 0;
                penalidades[authorId]++;

                if (penalidades[authorId] < 3) {
                    await chat.sendMessage(`⚠️ @${authorId.split('@')[0]}, avisos: ${penalidades[authorId]}/3.`, { mentions: [authorId] });
                } else {
                    await chat.removeParticipants([authorId]);
                    delete penalidades[authorId];
                }
            } catch (e) { console.log('Erro de Admin'); }
        }
    }
});

client.initialize();
