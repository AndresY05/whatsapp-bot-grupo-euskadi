// bot.js - Versión OPTIMIZADA PARA DOCKER - Grupo Euskadi
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const QRCode = require('qrcode');
const app = express();
const PORT = process.env.PORT || 3000;

let qrCodeGenerado = null;
let qrCodeDataUrl = null;
let botConectado = false;

// ========== SERVIDOR WEB ==========
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>Bot Grupo Euskadi</title></head>
            <body style="text-align:center; padding:50px; font-family:Arial;">
                <h1>🤖 Grupo Euskadi - RRHH</h1>
                <h2 style="color:${botConectado ? 'green' : 'orange'}">
                    ${botConectado ? '✅ BOT CONECTADO' : '⏳ ESPERANDO CONEXIÓN'}
                </h2>
                ${qrCodeGenerado && !botConectado ? '<p><a href="/qr">👉 VER QR 👈</a></p>' : ''}
            </body>
        </html>
    `);
});

app.get('/qr', (req, res) => {
    if (qrCodeDataUrl && !botConectado) {
        res.send(`
            <html>
                <body style="text-align:center; padding:20px; font-family:Arial;">
                    <h1>📱 ESCANEA ESTE QR</h1>
                    <img src="${qrCodeDataUrl}" alt="QR WhatsApp" width="350" height="350" />
                    <p>Abre WhatsApp, ve a <strong>Dispositivos vinculados</strong> y escanea el código.</p>
                </body>
            </html>
        `);
    } else {
        res.send('<h1>⏳ Generando QR... Recarga en 10 seg</h1><script>setTimeout(()=>location.reload(),10000);</script>');
    }
});

app.listen(PORT, '0.0.0.0', () => console.log(`✅ Servidor: http://localhost:${PORT}`));

// ========== CLIENTE CONFIGURADO ==========
const os = require('os');
const path = require('path');

let executablePath;
if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
} else if (os.platform() === 'linux') {
    executablePath = '/usr/bin/google-chrome-stable';
} else if (os.platform() === 'win32') {
    executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
} else {
    executablePath = undefined;
}

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './session' }),
    puppeteer: {
        headless: true,
        executablePath: executablePath,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process',
            '--disable-extensions'
        ]
    }
});

// ========== EVENTOS ==========
client.on('qr', async (qr) => {
    qrCodeGenerado = qr;
    qrCodeDataUrl = await QRCode.toDataURL(qr, { width: 350 });
    console.log('🔴 QR generado. Ve a /qr');
});

client.on('ready', () => {
    botConectado = true;
    qrCodeGenerado = null;
    qrCodeDataUrl = null;
    console.log('✅ BOT CONECTADO');
});

client.on('auth_failure', () => console.log('❌ Error de autenticación'));
client.on('disconnected', () => console.log('⚠️ Desconectado. Reconectando...'));

// ========== HORARIO (Chile) ==========
function estaEnHorario() {
    const now = new Date();
    const hora = now.getHours();
    const min = now.getMinutes();
    const dia = now.getDay();
    const inicio = (hora === 8 && min >= 30) || hora > 8;
    const fin = (hora === 18 && min <= 15) || hora < 18;
    return dia >= 1 && dia <= 5 && inicio && fin;
}

// ========== MENSAJES RRHH ==========
const MENSAJES_RRHH = {
    bienvenida: `Hola 👋 Bienvenido/a al canal de Recursos Humanos. Tu consulta es importante para nosotros, y será respondida a la brevedad dentro de nuestro horario de atención 🕘 Por favor, indícanos: Nombre completo Área o cargo Motivo de tu consulta Instalación ¡Gracias! 😊 Grupo Euskadi`,
    fueraHorario: `Hola 👋 Gracias por escribir a Recursos Humanos. En este momento estamos fuera de nuestro horario de atención 🕘 Nuestro horario es de lunes a viernes de 08:30 a 18:15 hrs. Te responderemos a la brevedad en el siguiente día hábil. ¡Gracias por tu paciencia! 🙌 Grupo Euskadi`,
    menuOpciones: `Hola 👋 Para ayudarte mejor, por favor indícanos el motivo de tu consulta: 1️⃣ Licencias médicas 2️⃣ Vacaciones 3️⃣ Liquidaciones de sueldo 4️⃣ Contrato o anexos 5️⃣ Otros Responde con el número de tu opción ✍️ Grupo Euskadi`,
    confirmacionRecepcion: `Hola 👋 Hemos recibido tu solicitud correctamente ✅ Nuestro equipo la revisará y te responderá dentro de las próximas horas. ¡Gracias por contactarte con Recursos Humanos! 😊 Grupo Euskadi`,
    solicitudDocumentos: `Hola 👋 Para poder ayudarte, necesitamos que adjuntes los siguientes documentos: 📎 Especificar documentos, por ejemplo: licencia médica, cédula de identidad, etc. Una vez recibidos, continuaremos con tu solicitud. ¡Gracias! 🙌 Grupo Euskadi`,
    infoVacaciones: `Hola 👋 Sobre tu consulta de vacaciones: 📌 Puedes revisar tu saldo directamente en indicar plataforma o sistema interno. 📌 Para solicitar vacaciones, debes enviar tu solicitud a través de indicar proceso. Si necesitas más ayuda, escríbenos nuevamente 😊 Grupo Euskadi`,
    cierreConversacion: `Hola 👋 Esperamos haber resuelto tu consulta 😊 Si necesitas más ayuda, no dudes en escribirnos nuevamente. ¡Que tengas un excelente día! 🌟 Grupo Euskadi`
};

// ========== MENSAJES (simplificados pero funcionales) ==========
const usuariosSaludados = new Set();

client.on('message', async (message) => {
    if (message.fromMe) return;
    if (!estaEnHorario()) {
        await message.reply(MENSAJES_RRHH.fueraHorario);
        return;
    }
    if (!usuariosSaludados.has(message.from)) {
        await message.reply(MENSAJES_RRHH.bienvenida);
        usuariosSaludados.add(message.from);
    }
});

client.initialize();
console.log('🚀 Bot iniciado');