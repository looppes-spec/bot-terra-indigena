const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/usr/bin/google-chrome-stable', 
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

// Memória temporária de penalidades
const penalidades = {};

client.on('qr', (qr) => {
    console.log('Escaneie o código QR abaixo para conectar:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('SISTEMA TERRA INDÍGENA ONLINE! Monitorando convites...');
});

client.on('message', async (msg) => {
    // FILTRO EXCLUSIVO: Só age se for link de convite do WhatsApp
    if (msg.body.includes('chat.whatsapp.com')) {
        const chat = await msg.getChat();
        
        // Só atua em grupos e ignora mensagens do próprio bot
        if (chat.isGroup && !msg.fromMe) {
            const authorId = msg.author || msg.from;
            const participants = chat.participants;
            
            // Verifica se o bot é administrador
            const botInGroup = participants.find(p => p.id._serialized === client.info.wid._serialized);

            if (botInGroup && botInGroup.isAdmin) {
                try {
                    // 1. Apaga o link imediatamente
                    await msg.delete(true);
                    console.log(`Convite removido de: ${authorId}`);

                    // 2. Sistema de avisos
                    if (!penalidades[authorId]) {
                        penalidades[authorId] = 0;
                    }
                    penalidades[authorId]++;

                    if (penalidades[authorId] < 3) {
                        // Avisa o infrator
                        await chat.sendMessage(`⚠️ @${authorId.split('@')[0]}, não é permitido enviar links de outros grupos aqui.\n\nAviso ${penalidades[authorId]}/3. Na terceira vez você será removido.`, {
                            mentions: [authorId]
                        });
                    } else {
                        // Terceira vez: Remoção automática
                        await chat.sendMessage(`🚫 @${authorId.split('@')[0]} removido por excesso de convites externos.`, {
                            mentions: [authorId]
                        });
                        await chat.removeParticipants([authorId]);
                        delete penalidades[authorId]; // Limpa o histórico
                    }

                } catch (error) {
                    console.error('Erro ao processar regra:', error.message);
                }
            } else {
                console.log('Aviso: O bot não é admin neste grupo.');
            }
        }
    }
});

client.initialize();
