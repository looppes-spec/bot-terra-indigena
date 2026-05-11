const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process'
        ],
        executablePath: '/usr/bin/google-chrome-stable'
    }
});

const avisos = {};
const linkRegex = /chumt\.chumtsumpp\.com\/[a-zA-Z0-9]+/;

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('Escaneie o código QR acima:');
});

client.on('ready', () => {
    console.log('Robô Terra Indígena ONLINE!');
});

client.on('message', async msg => {
    try {
        const chat = await msg.getChat();
        if (chat.isGroup && linkRegex.test(msg.body)) {
            const chatParticipants = chat.participants;
            const botInGroup = chatParticipants.find(p => p.id._serialized === client.info.wid._serialized);
            if (botInGroup && botInGroup.isAdmin) {
                await msg.delete(true);
                console.log('Link removido com sucesso.');
            }
        }
    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
    }
});

client.initialize();  
