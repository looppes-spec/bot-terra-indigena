const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process'
        ],
    }
});

const avisos = {};

client.on('qr', (qr) => {
    console.log('Escaneie o código QR acima:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot da Terra Indígena está ONLINE!');
});

client.on('message', async (msg) => {
    if (msg.body.includes('http://')  msg.body.includes('https://')  msg.body.includes('www.')) {
        const chat = await msg.getChat();
        const contact = await msg.getContact();

        if (chat.isGroup && !msg.fromMe) {
            const authorId = msg.author || msg.from;
            const isAdmin = chat.participants.find(p => p.id._serialized === authorId)?.isAdmin;

            if (!isAdmin) {
                await msg.delete(true);
                if (!avisos[authorId]) {
                    avisos[authorId] = 1;
                    await chat.sendMessage(@${contact.id.user}, links não são permitidos neste grupo., {
                        mentions: [contact]
                    });
                }
            }
        }
    }
});

client.initialize();
