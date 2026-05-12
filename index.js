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

client.on('qr', (qr) => {
    console.log('Escaneie o código QR abaixo:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Robô Terra Indígena ONLINE!');
});

client.on('message', async (msg) => {
    if (msg.body.includes('http://') || msg.body.includes('https://') || msg.body.includes('www.')) {
        const chat = await msg.getChat();
        if (chat.isGroup && !msg.fromMe) {
            const authorId = msg.author || msg.from;
            const participants = chat.participants;
            const botInGroup = participants.find(p => p.id._serialized === client.info.wid._serialized);

            if (botInGroup && botInGroup.isAdmin) {
                await msg.delete(true);
                console.log('Link removido.');
            }
        }
    }
});

client.initialize();
