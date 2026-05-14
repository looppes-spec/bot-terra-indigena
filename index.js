const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const puppeteer = require('puppeteer');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        handleSIGTERM: false,
        executablePath: puppeteer.executablePath(), // Ele mesmo acha o Chrome
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--no-zygote',
            '--single-process'
        ],
    }
});

// ... resto do seu código de avisos e links ...

client.on('qr', (qr) => {
    console.log('--- QR CODE GERADO ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => console.log('MOTOR LIGADO!'));

client.initialize();
