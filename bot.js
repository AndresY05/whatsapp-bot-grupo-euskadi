// bot.js - Bot de WhatsApp para Grupo Euskadi - Versión Railway
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// Servidor web para mantener vivo el bot
app.get('/', (req, res) => {
    res.send('🤖 Bot de WhatsApp - Grupo Euskadi - Funcionando 24/7');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Servidor web activo en puerto ${PORT}`);
});

// Configuración
const HORARIO_INICIO = 8;
const HORARIO_FIN = 18;
const EMPRESA = "Grupo Euskadi";

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    }
});

// Mostrar QR de forma legible para Railway
client.on('qr', (qr) => {
    console.log('═══════════════════════════════════════════════════');
    console.log('🔐 ESCANEA ESTE QR CON WHATSAPP:');
    console.log('═══════════════════════════════════════════════════');
    qrcode.generate(qr, { small: true });
    console.log('📱 Abre WhatsApp → Menú → Dispositivos vinculados');
    console.log('═══════════════════════════════════════════════════');
});

client.on('ready', () => {
    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ Bot de WhatsApp - ${EMPRESA} - CONECTADO CORRECTAMENTE`);
    console.log(`📅 Horario: Lunes a Viernes de ${HORARIO_INICIO}:00 a ${HORARIO_FIN}:00 hrs`);
    console.log('🎯 El bot está listo para responder mensajes 24/7');
    console.log('═══════════════════════════════════════════════════');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación:', msg);
});

client.on('disconnected', (reason) => {
    console.log('⚠️ Bot desconectado:', reason);
});

function estaEnHorarioLaboral() {
    const ahora = new Date();
    const hora = ahora.getHours();
    const dia = ahora.getDay();
    if (dia === 0 || dia === 6) return false;
    return hora >= HORARIO_INICIO && hora < HORARIO_FIN;
}

function getMensajeFueraHorario() {
    return `📌 Fuera de horario

Hola 👋
Gracias por escribir a Recursos Humanos de *${EMPRESA}*.

Horario: *lunes a viernes de 08:00 a 18:00 hrs*.

Te responderemos el próximo día hábil. 🙌`;
}

// Estado de conversación simple
let esperandoQR = true;

client.on('message', async (message) => {
    try {
        if (!estaEnHorarioLaboral()) {
            await message.reply(getMensajeFueraHorario());
            return;
        }

        if (esperandoQR) {
            await message.reply(`Hola 👋\n\nBienvenido a Recursos Humanos de ${EMPRESA}.\n\nPor favor indícanos tu nombre completo, instalación y motivo de consulta.`);
            esperandoQR = false;
        } else {
            await message.reply(`✅ Hemos recibido tu consulta.\n\nNuestro equipo te responderá a la brevedad.\n\n¡Gracias por contactarte con ${EMPRESA}!`);
        }
    } catch (error) {
        console.error('❌ Error al procesar mensaje:', error);
    }
});

// Mantener el proceso vivo
process.on('SIGTERM', () => {
    console.log('⚠️ Recibida señal SIGTERM, ignorando para mantener el bot vivo...');
});

process.on('SIGINT', () => {
    console.log('⚠️ Recibida señal SIGINT, ignorando para mantener el bot vivo...');
});

client.initialize();
console.log(`🚀 Bot iniciado - ${EMPRESA}`);
console.log('💡 Esperando código QR...');