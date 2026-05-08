const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

const avisos = {};
const linkRegex = /chat\.whatsapp\.com\/[a-zA-Z0-9]/;

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
    console.log('Escaneie o código acima:');
});

client.on('ready', () => {
    console.log('Robô Terra Indígena ONLINE!');
});

client.on('message', async msg => {
    try {
        const chat = await msg.getChat();
        if (chat.isGroup && linkRegex.test(msg.body)) {
            const participantes = chat.participants;
            const euNoGrupo = participantes.find(p => p.id._serialized === client.info.wid._serialized);

            if (euNoGrupo && euNoGrupo.isAdmin) {
                const user = msg.author || msg.from;
                const msgAutor = participantes.find(p => p.id._serialized === user);
                if (msgAutor && msgAutor.isAdmin) return;

                await msg.delete(true).catch(e => console.log('Erro ao deletar msg'));
                avisos[user] = (avisos[user] || 0) + 1;

                if (avisos[user] < 3) {
                    await msg.reply('⚠️ Aviso ' + avisos[user] + '/3: Proibido links de outros grupos aqui!');
                } else {
                    await msg.reply('🚫 Removendo por excesso de avisos...');
                    await chat.removeParticipants([user]).catch(e => console.log('Erro ao remover'));
                    delete avisos[user];
                }
            }
        }
    } catch (e) {
        console.log('Erro no processamento');
    }
});

client.initialize();