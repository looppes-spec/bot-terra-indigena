const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Configuração otimizada para o servidor Render
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        handleSIGTERM: false,
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

// Memória de penalidades (Reseta se o bot reiniciar na Render)
const penalidades = {};

client.on('qr', (qr) => {
    console.log('--- ESCANEIE O QR CODE ABAIXO ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('SISTEMA TERRA INDÍGENA ONLINE! Monitorando convites de grupos...');
});

client.on('message', async (msg) => {
    // Filtro cirúrgico: Só links de convite de grupos do WhatsApp
    if (msg.body.includes('chat.whatsapp.com')) {
        const chat = await msg.getChat();
        
        // Só age em grupos e ignora mensagens do próprio bot
        if (chat.isGroup && !msg.fromMe) {
            const authorId = msg.author || msg.from;
            const participants = chat.participants;
            
            // Verifica se o bot é administrador para poder agir
            const botInGroup = participants.find(p => p.id._serialized === client.info.wid._serialized);

            if (botInGroup && botInGroup.isAdmin) {
                try {
                    // 1. Apaga o link imediatamente
                    await msg.delete(true);
                    console.log(`Convite de grupo interceptado de: ${authorId}`);

                    // 2. Gerencia a contagem de avisos
                    if (!penalidades[authorId]) {
                        penalidades[authorId] = 0;
                    }
                    penalidades[authorId]++;

                    if (penalidades[authorId] < 3) {
                        // Envia o aviso educado com menção
                        await chat.sendMessage(`⚠️ Atenção @${authorId.split('@')[0]}, não é permitido enviar links de outros grupos aqui.\n\nEsta é sua penalidade ${penalidades[authorId]}/3. Na próxima você será removido automaticamente.`, {
                            mentions: [authorId]
                        });
                    } else {
                        // Terceira infração: Remoção automática
                        await chat.sendMessage(`🚫 @${authorId.split('@')[0]} foi removido por insistir no envio de convites externos.`, {
                            mentions: [authorId]
                        });
                        await chat.removeParticipants([authorId]);
                        
                        // Limpa o histórico dele após a remoção
                        delete penalidades[authorId];
                    }

                } catch (error) {
                    console.error('Falha ao processar regra de grupo:', error.message);
                }
            } else {
                console.log('Aviso: O bot precisa ser Administrador para remover links e membros.');
            }
        }
    }
});

client.initialize();
