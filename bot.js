// bot.js - Bot de WhatsApp para Grupo Euskadi - Versión con QR forzado
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

let qrCodeGenerado = null;
let botListo = false;

// ========== SERVIDOR WEB ==========
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>Bot Grupo Euskadi</title></head>
            <body style="text-align:center; padding:50px; font-family:Arial;">
                <h1>🤖 Bot de WhatsApp - Grupo Euskadi</h1>
                <p>Estado: ${botListo ? '🟢 CONECTADO' : '🟡 INICIANDO...'}</p>
                <p>📱 Para conectar el bot, ve a <a href="/qr">/qr</a></p>
            </body>
        </html>
    `);
});

app.get('/qr', (req, res) => {
    if (qrCodeGenerado) {
        res.send(`
            <html>
                <head>
                    <title>QR - Grupo Euskadi</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { text-align:center; padding:20px; font-family:Arial; background:#f0f0f0; }
                        .qr-container { background:white; border-radius:20px; padding:30px; max-width:500px; margin:0 auto; }
                        img { max-width:100%; border:5px solid #25D366; border-radius:15px; }
                    </style>
                </head>
                <body>
                    <div class="qr-container">
                        <h1>🤖 Grupo Euskadi - RRHH</h1>
                        <h2>📱 Escanea este QR</h2>
                        <img src="https://quickchart.io/qr?text=${encodeURIComponent(qrCodeGenerado)}&size=350" />
                        <p><strong>Pasos:</strong></p>
                        <p>1️⃣ Abre WhatsApp → Menú → Dispositivos vinculados</p>
                        <p>2️⃣ Toca "Vincular dispositivo"</p>
                        <p>3️⃣ Escanea el código QR de arriba</p>
                        <p>✅ ¡El bot comenzará a funcionar!</p>
                    </div>
                </body>
            </html>
        `);
    } else {
        res.send(`
            <html>
                <body style="text-align:center; padding:50px; font-family:Arial;">
                    <h1>⏳ Generando código QR...</h1>
                    <p>El bot está iniciando. Espera 1-2 minutos y recarga esta página.</p>
                    <p><strong>Estado del bot:</strong> ${botListo ? 'Conectado' : 'Iniciando...'}</p>
                    <script>setTimeout(() => location.reload(), 5000);</script>
                </body>
            </html>
        `);
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor web: https://localhost:${PORT}`);
    console.log(`📱 URL para QR: https://tuproyecto.railway.app/qr`);
});

// ========== CONFIGURACIÓN ==========
const EMPRESA = "Grupo Euskadi";
const HORARIO_INICIO = 8;
const HORARIO_FIN = 18;

console.log('🚀 Iniciando bot...');
console.log('⏳ Cargando Puppeteer (esto toma 30-60 segundos)...');

// ========== CLIENTE ==========
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    }
});

// ========== QR ==========
client.on('qr', (qr) => {
    qrCodeGenerado = qr;
    console.log('\n========================================');
    console.log('🔴 QR GENERADO');
    console.log('========================================');
    console.log('📱 Ve a: https://TU_PROYECTO.railway.app/qr');
    console.log('========================================\n');
});

// ========== CONECTADO ==========
client.on('ready', () => {
    botListo = true;
    qrCodeGenerado = null;
    console.log('\n========================================');
    console.log('✅ BOT CONECTADO - GRUPO EUSKADI');
    console.log('🎯 El bot ya responde mensajes');
    console.log('========================================\n');
});

client.on('auth_failure', () => {
    console.log('❌ Error de autenticación. Esperando nuevo QR...');
});

client.on('disconnected', () => {
    console.log('⚠️ Bot desconectado. Reconectando...');
    botListo = false;
});

// ========== HORARIO ==========
function estaEnHorarioLaboral() {
    const ahora = new Date();
    const hora = ahora.getHours();
    const dia = ahora.getDay();
    if (dia === 0 || dia === 6) return false;
    return hora >= 8 && hora < 18;
}

// ========== MENSAJES ==========
function getMensajeFueraHorario() {
    return `📌 Fuera de horario

Hola 👋
Gracias por escribir a Recursos Humanos de *${EMPRESA}*.

Horario: *lunes a viernes de 08:00 a 18:00 hrs*.

Te responderemos el próximo día hábil. 🙌`;
}

function getMensajeBienvenida() {
    return `Hola 👋
Bienvenido/a a Recursos Humanos de *${EMPRESA}*.

Por favor, indícanos:

📌 *Nombre completo*
📌 *¿De cuál instalación vienes?*
📌 *Motivo de tu consulta*

¡Gracias! 😊`;
}

function getMensajeConfirmacion() {
    return `✅ Hemos recibido tu solicitud.

¿Tu consulta es sobre información general? (responde SI o NO)`;
}

function getMenuInfoGeneral() {
    return `📌 Información General

1️⃣ Licencias médicas
2️⃣ Vacaciones
3️⃣ Liquidaciones de sueldo
4️⃣ Contrato o anexos
5️⃣ Otros

Responde con el número ✍️`;
}

function getRespuestaOpcion(opcion) {
    const respuestas = {
        '1': '📌 Licencias médicas - Adjunta el documento.',
        '2': '📌 Vacaciones - Revisa tu saldo en el sistema interno.',
        '3': '📌 Liquidaciones - Descárgalas desde el portal.',
        '4': '📌 Contrato - Indícanos tu RUT.',
        '5': '📌 Otros - Describe tu consulta.'
    };
    return respuestas[opcion] || 'Opción no válida. Responde 1,2,3,4 o 5.';
}

function getMensajeCierre() {
    return `📌 ¡Gracias por contactarnos! Que tengas un excelente día 🌟`;
}

// ========== ESTADOS ==========
const estados = new Map();

client.on('message', async (message) => {
    try {
        if (message.fromMe) return;
        
        const numero = message.from;
        const cuerpo = message.body.trim().toLowerCase();
        const original = message.body.trim();

        console.log(`📩 Mensaje de ${numero}`);

        if (!estaEnHorarioLaboral()) {
            await message.reply(getMensajeFueraHorario());
            return;
        }

        let estado = estados.get(numero) || 'inicio';

        if (cuerpo === 'salir') {
            estados.delete(numero);
            await message.reply(getMensajeCierre());
            return;
        }

        if (estado === 'inicio') {
            estados.set(numero, 'esperando_datos');
            await message.reply(getMensajeBienvenida());
        } 
        else if (estado === 'esperando_datos') {
            await message.reply(getMensajeConfirmacion());
            estados.set(numero, 'preguntando_si');
        }
        else if (estado === 'preguntando_si') {
            if (cuerpo === 'si') {
                estados.set(numero, 'esperando_opcion');
                await message.reply(getMenuInfoGeneral());
            } else {
                estados.delete(numero);
                await message.reply('Consulta registrada. Te responderemos pronto.');
            }
        }
        else if (estado === 'esperando_opcion' && /^[1-5]$/.test(cuerpo)) {
            await message.reply(getRespuestaOpcion(cuerpo));
            estados.delete(numero);
            await message.reply(getMensajeCierre());
        }
        else if (estado === 'esperando_opcion') {
            await message.reply('Responde con un número del 1 al 5.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
});

// ========== INICIAR ==========
client.initialize();
console.log('💡 QR aparecerá en 30-90 segundos...');