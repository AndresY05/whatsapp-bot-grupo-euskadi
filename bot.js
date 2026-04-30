// bot.js - Bot de WhatsApp para Grupo Euskadi - Flujo COMPLETO + QR en URL
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ========== SERVIDOR WEB PARA KEEP ALIVE Y QR ==========
let qrCodeGenerado = null;

app.get('/', (req, res) => {
    res.send('🤖 Bot de WhatsApp - Grupo Euskadi - Funcionando 24/7');
});

// Endpoint para ver el QR en el navegador
app.get('/qr', (req, res) => {
    if (qrCodeGenerado) {
        res.send(`
            <html>
                <head>
                    <title>QR Bot - Grupo Euskadi</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            text-align: center;
                            padding: 50px;
                            background: #f0f0f0;
                        }
                        .container {
                            background: white;
                            border-radius: 20px;
                            padding: 30px;
                            max-width: 500px;
                            margin: 0 auto;
                            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                            border: 5px solid #25D366;
                            border-radius: 15px;
                        }
                        h1 { color: #075E54; }
                        .steps {
                            text-align: left;
                            margin-top: 20px;
                            padding: 15px;
                            background: #f9f9f9;
                            border-radius: 10px;
                        }
                        .qr-text {
                            font-family: monospace;
                            font-size: 10px;
                            word-break: break-all;
                            background: #eee;
                            padding: 10px;
                            border-radius: 5px;
                            margin-top: 15px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>🤖 Grupo Euskadi</h1>
                        <h2>Recursos Humanos</h2>
                        <h3>📱 Escanea este QR con WhatsApp</h3>
                        <img src="https://quickchart.io/qr?text=${encodeURIComponent(qrCodeGenerado)}&size=350" />
                        <div class="steps">
                            <strong>📌 Pasos:</strong><br>
                            1️⃣ Abre WhatsApp en tu teléfono<br>
                            2️⃣ Menú (⋮) → Dispositivos vinculados<br>
                            3️⃣ Toca "Vincular dispositivo"<br>
                            4️⃣ ESCANEA el código QR de arriba<br>
                            5️⃣ ¡El bot comenzará a funcionar!
                        </div>
                        <div class="qr-text">
                            <strong>🔐 Texto del QR (copia si es necesario):</strong><br>
                            ${qrCodeGenerado.substring(0, 200)}...
                        </div>
                    </div>
                </body>
            </html>
        `);
    } else {
        res.send(`
            <html>
                <head><title>QR Bot - Grupo Euskadi</title></head>
                <body style="text-align:center; padding:50px; font-family:Arial;">
                    <h1>🤖 Grupo Euskadi - RRHH</h1>
                    <p>⏳ <strong>Generando código QR...</strong></p>
                    <p>Espera unos segundos y recarga esta página.</p>
                    <p>📱 Si ya escaneaste el QR, el bot ya está conectado.</p>
                    <p><small>La página se actualiza automáticamente cada 10 segundos</small></p>
                    <script>
                        setTimeout(() => location.reload(), 10000);
                    </script>
                </body>
            </html>
        `);
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Servidor web activo en puerto ${PORT}`);
    console.log(`📱 PARA ESCANEAR QR: https://tuservicio.railway.app/qr`);
});

// ========== CONFIGURACIÓN ==========
const HORARIO_INICIO = 8;
const HORARIO_FIN = 18;
const EMPRESA = "Grupo Euskadi";

// ========== CLIENTE OPTIMIZADO PARA RAILWAY ==========
console.log('🔄 Inicializando bot para Railway...');

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "whatsapp-bot-rrhh",
        dataPath: "./.wwebjs_auth"
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-default-apps',
            '--disable-sync',
            '--disable-translate',
            '--hide-scrollbars',
            '--metrics-recording-only',
            '--mute-audio',
            '--no-first-run',
            '--safebrowsing-disable-auto-update',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
        ],
        protocolTimeout: 300000,
        timeout: 300000
    }
});

// ========== QR - CON LOGS Y URL ==========
client.on('qr', (qr) => {
    qrCodeGenerado = qr;
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║     🔴 QR GENERADO - ESCANEA CON WHATSAPP WEB 🔴             ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n📋 TEXTO DEL QR (primeros 100 caracteres):');
    console.log(qr.substring(0, 100) + '...\n');
    console.log('🌐 VER QR EN NAVEGADOR:');
    console.log(`   https://quickchart.io/qr?text=${encodeURIComponent(qr)}&size=350`);
    console.log('\n📱 INSTRUCCIONES:');
    console.log('   1. Abre WhatsApp en tu teléfono');
    console.log('   2. Menú (⋮) → Dispositivos vinculados');
    console.log('   3. Toca "Vincular dispositivo"');
    console.log('   4. ESCANEA el QR de arriba o desde el enlace');
    console.log('══════════════════════════════════════════════════════════════\n');
});

// ========== EVENTOS DE DEPURACIÓN ==========
client.on('authenticated', () => {
    console.log('✅ Autenticación exitosa - QR escaneado correctamente');
    qrCodeGenerado = null;
});

client.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación:', msg);
    console.log('🔄 Esperando nuevo QR...');
});

client.on('disconnected', (reason) => {
    console.log('⚠️ Bot desconectado:', reason);
    console.log('🔄 Reconectando en 5 segundos...');
    setTimeout(() => {
        client.initialize();
    }, 5000);
});

client.on('loading', (status) => {
    console.log('⏳ Cargando:', status);
});

client.on('ready', () => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║     ✅ BOT CONECTADO CORRECTAMENTE                          ║');
    console.log(`║     📌 ${EMPRESA} - Recursos Humanos                         ║`);
    console.log(`║     🕘 Horario: Lunes a Viernes de ${HORARIO_INICIO}:00 a ${HORARIO_FIN}:00 hrs       ║`);
    console.log('║     🎯 El bot está listo para responder mensajes            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
});

// ========== VERIFICAR HORARIO LABORAL ==========
function estaEnHorarioLaboral() {
    const ahora = new Date();
    const hora = ahora.getHours();
    const diaSemana = ahora.getDay();
    if (diaSemana === 0 || diaSemana === 6) return false;
    return hora >= HORARIO_INICIO && hora < HORARIO_FIN;
}

// ========== MENSAJES DEL SISTEMA ==========
function getMensajeFueraHorario() {
    return `📌 Fuera de horario

Hola 👋
Gracias por escribir a Recursos Humanos de *${EMPRESA}*.

En este momento estamos fuera de nuestro horario de atención 🕘
Nuestro horario es de *lunes a viernes de 08:00 a 18:00 hrs*.

Te responderemos a la brevedad en el siguiente día hábil. ¡Gracias por tu paciencia! 🙌`;
}

function getMensajeBienvenida() {
    return `Hola 👋
Bienvenido/a al canal de Recursos Humanos de *${EMPRESA}*.

Tu consulta es importante para nosotros, y será respondida a la brevedad dentro de nuestro horario de atención 🕘

Por favor, indícanos:

📌 *Nombre completo*
📌 *¿De cuál instalación vienes?*
📌 *Motivo de tu consulta*

¡Gracias! 😊`;
}

function getMensajeConfirmacion() {
    return `📌 Confirmación de recepción

Hola 👋
Hemos recibido tu solicitud correctamente ✅

Nuestro equipo de ${EMPRESA} la revisará y te responderá dentro de las próximas horas.

¡Gracias por contactarte con Recursos Humanos! 😊`;
}

function getMenuInfoGeneral() {
    return `📌 Solicitud de información general - ${EMPRESA}

Hola 👋
Para ayudarte mejor, por favor indícanos el motivo de tu consulta:

1️⃣ Licencias médicas
2️⃣ Vacaciones
3️⃣ Liquidaciones de sueldo
4️⃣ Contrato o anexos
5️⃣ Otros

Responde con el número de tu opción ✍️`;
}

function getRespuestaOpcion(opcion) {
    const respuestas = {
        '1': `📌 *Licencias médicas* - ${EMPRESA}

Para gestionar tu licencia médica, necesitamos que adjuntes el documento escaneado o foto de la licencia.

📎 Por favor, adjunta: Licencia médica (frontal y trasera)

Una vez recibida, la derivaremos al área correspondiente.`,
        '2': `📌 *Vacaciones* - ${EMPRESA}

Sobre tu consulta de vacaciones:

📌 Puedes revisar tu saldo directamente en el sistema interno
📌 Para solicitar vacaciones, debes enviar tu solicitud a través del formulario interno.

Si necesitas más ayuda, escríbenos nuevamente 😊`,
        '3': `📌 *Liquidaciones de sueldo* - ${EMPRESA}

Puedes descargar tus liquidaciones de sueldo desde el portal del colaborador.

Si necesitas una copia de períodos anteriores, indícanos qué meses requieres.`,
        '4': `📌 *Contrato o anexos* - ${EMPRESA}

Para solicitar una copia de tu contrato o anexos, indícanos:
- Tu RUT
- Qué documento específico necesitas

Te lo enviaremos a través del sistema interno.`,
        '5': `📌 *Otros* - ${EMPRESA}

Por favor, describe tu consulta con detalle y en la brevedad te responderemos.`
    };
    return respuestas[opcion] || `Opción no válida. Responde con un número del 1 al 5.`;
}

function getMensajeCierre() {
    return `📌 *Cierre de conversación*

Hola 👋
Esperamos haber resuelto tu consulta 😊

Si necesitas más ayuda, no dudes en escribirnos nuevamente.
*${EMPRESA}* agradece tu contacto.

¡Que tengas un excelente día! 🌟`;
}

// ========== MANEJO DE CONVERSACIONES ==========
const estados = new Map();
const ESTADOS = {
    INICIO: 'inicio',
    ESPERANDO_DATOS: 'esperando_datos',
    ESPERANDO_OPCION: 'esperando_opcion'
};

// ========== PROCESAR MENSAJES ==========
client.on('message', async (message) => {
    try {
        const contacto = await message.getContact();
        const numero = contacto.number;
        const cuerpo = message.body.trim().toLowerCase();
        const cuerpoOriginal = message.body.trim();

        console.log(`📩 Mensaje de ${numero}: ${cuerpoOriginal.substring(0, 50)}`);

        if (!estaEnHorarioLaboral()) {
            await message.reply(getMensajeFueraHorario());
            return;
        }

        let estado = estados.get(numero) || ESTADOS.INICIO;

        if (cuerpo === 'salir' || cuerpo === 'fin') {
            estados.delete(numero);
            await message.reply(getMensajeCierre());
            return;
        }

        if (estado === ESTADOS.INICIO) {
            estados.set(numero, ESTADOS.ESPERANDO_DATOS);
            await message.reply(getMensajeBienvenida());

        } else if (estado === ESTADOS.ESPERANDO_DATOS) {
            console.log(`📋 Datos de ${numero}: ${cuerpoOriginal}`);
            await message.reply(getMensajeConfirmacion());
            await message.reply("¿Tu consulta es sobre información general? (responde SI o NO)");
            estados.set(numero, 'preguntando_si');

        } else if (estado === 'preguntando_si') {
            if (cuerpo === 'si') {
                estados.set(numero, ESTADOS.ESPERANDO_OPCION);
                await message.reply(getMenuInfoGeneral());
            } else {
                estados.delete(numero);
                await message.reply("Perfecto, tu consulta ha sido registrada. Te responderemos a la brevedad.");
            }

        } else if (estado === ESTADOS.ESPERANDO_OPCION && /^[1-5]$/.test(cuerpo)) {
            await message.reply(getRespuestaOpcion(cuerpo));
            estados.delete(numero);
            await message.reply(getMensajeCierre());

        } else if (estado === ESTADOS.ESPERANDO_OPCION) {
            await message.reply("Por favor, responde con un número del 1 al 5.");
        }

    } catch (error) {
        console.error('❌ Error:', error);
        await message.reply('Lo sentimos, ocurrió un error. Por favor intenta nuevamente.');
    }
});

// ========== MANTENER EL PROCESO VIVO ==========
process.on('SIGTERM', () => {
    console.log('⚠️ Señal SIGTERM ignorada. El bot sigue funcionando...');
});

process.on('SIGINT', () => {
    console.log('⚠️ Señal SIGINT ignorada. El bot sigue funcionando...');
});

// ========== INICIAR EL BOT ==========
client.initialize();
console.log(`🚀 Bot iniciado - ${EMPRESA}`);
console.log('💡 Esperando código QR...');