// bot.js - Bot de WhatsApp para Grupo Euskadi - Versión DEFINITIVA
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

let qrCodeGenerado = null;
let botConectado = false;

// ========== SERVIDOR WEB ==========
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Bot Grupo Euskadi - RRHH</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0; }
                    .container { background: white; border-radius: 20px; padding: 30px; max-width: 500px; margin: 0 auto; }
                    .conectado { color: green; }
                    .esperando { color: orange; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🤖 Grupo Euskadi - RRHH</h1>
                    <h2 class="${botConectado ? 'conectado' : 'esperando'}">
                        ${botConectado ? '✅ BOT CONECTADO' : '⏳ ESPERANDO CONEXIÓN'}
                    </h2>
                    ${qrCodeGenerado && !botConectado ? `
                        <p>📱 <strong>Escanea el QR:</strong></p>
                        <a href="/qr">👉 HAZ CLIC AQUÍ PARA VER EL QR 👈</a>
                    ` : ''}
                    ${botConectado ? '<p>🎯 El bot ya está respondiendo mensajes</p>' : ''}
                    <p><small>Horario: Lunes a Viernes 8:00 - 18:00 hrs</small></p>
                </div>
            </body>
        </html>
    `);
});

app.get('/qr', (req, res) => {
    if (qrCodeGenerado && !botConectado) {
        res.send(`
            <html>
                <head>
                    <title>QR - Grupo Euskadi</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { text-align: center; padding: 20px; font-family: Arial; background: #f0f0f0; }
                        .qr-container { background: white; border-radius: 20px; padding: 30px; max-width: 500px; margin: 0 auto; }
                        img { max-width: 100%; border: 5px solid #25D366; border-radius: 15px; }
                        .steps { text-align: left; margin-top: 20px; background: #f9f9f9; padding: 15px; border-radius: 10px; }
                    </style>
                </head>
                <body>
                    <div class="qr-container">
                        <h1>🤖 Grupo Euskadi</h1>
                        <h2>📱 ESCANEA ESTE QR</h2>
                        <img src="https://quickchart.io/qr?text=${encodeURIComponent(qrCodeGenerado)}&size=350" />
                        <div class="steps">
                            <strong>📌 PASOS:</strong><br><br>
                            1️⃣ Abre WhatsApp en tu teléfono<br>
                            2️⃣ Menú (⋮) → Dispositivos vinculados<br>
                            3️⃣ Toca "Vincular dispositivo"<br>
                            4️⃣ ESCANEA el código QR de arriba<br>
                            5️⃣ ¡El bot comenzará a funcionar!
                        </div>
                        <p><small>El QR expira en 2 minutos. Si expira, refresca esta página.</small></p>
                    </div>
                </body>
            </html>
        `);
    } else if (botConectado) {
        res.send(`
            <html>
                <body style="text-align:center; padding:50px; font-family:Arial;">
                    <h1>✅ BOT YA ESTÁ CONECTADO</h1>
                    <p>El QR ya no es necesario. El bot ya está respondiendo mensajes.</p>
                    <a href="/">Volver al inicio</a>
                </body>
            </html>
        `);
    } else {
        res.send(`
            <html>
                <body style="text-align:center; padding:50px; font-family:Arial;">
                    <h1>⏳ GENERANDO QR...</h1>
                    <p>Espera 30-60 segundos y recarga esta página.</p>
                    <script>setTimeout(() => location.reload(), 10000);</script>
                </body>
            </html>
        `);
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor web: http://localhost:${PORT}`);
});

// ========== CONFIGURACIÓN ==========
const EMPRESA = "Grupo Euskadi";
const HORARIO_INICIO = 8;
const HORARIO_FIN = 18;

console.log('🚀 Iniciando bot de WhatsApp...');
console.log('⏳ Esto puede tomar 30-60 segundos...');

// ========== CONFIGURACIÓN DEL CLIENTE ==========
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "grupo-euskadi-bot",
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
            '--no-first-run',
            '--disable-features=VizDisplayCompositor',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
        ],
        protocolTimeout: 180000,
        timeout: 120000
    }
});

// ========== EVENTO QR ==========
client.on('qr', (qr) => {
    qrCodeGenerado = qr;
    console.log('\n=========================================');
    console.log('🔴 QR GENERADO');
    console.log('=========================================');
    console.log(`📱 Para escanear el QR, ve a:`);
    console.log(`   https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'localhost'}/qr`);
    console.log('=========================================\n');
});

// ========== EVENTO AUTENTICACIÓN ==========
client.on('authenticated', () => {
    console.log('✅ Autenticación exitosa');
    qrCodeGenerado = null;
});

// ========== EVENTO CONECTADO ==========
client.on('ready', () => {
    botConectado = true;
    qrCodeGenerado = null;
    console.log('\n=========================================');
    console.log('✅ BOT CONECTADO CORRECTAMENTE');
    console.log(`📌 ${EMPRESA} - Recursos Humanos`);
    console.log(`🕘 Horario: Lunes a Viernes ${HORARIO_INICIO}:00 - ${HORARIO_FIN}:00 hrs`);
    console.log('🎯 El bot ya está respondiendo mensajes');
    console.log('=========================================\n');
});

// ========== EVENTO ERROR ==========
client.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación:', msg);
    console.log('🔄 Esperando nuevo QR...');
    botConectado = false;
});

client.on('disconnected', (reason) => {
    console.log('⚠️ Bot desconectado:', reason);
    console.log('🔄 Reconectando en 5 segundos...');
    botConectado = false;
    setTimeout(() => client.initialize(), 5000);
});

// ========== VERIFICAR HORARIO ==========
function estaEnHorarioLaboral() {
    const ahora = new Date();
    // Ajuste horario para Chile (UTC-3 o UTC-4 según época del año)
    const horaChile = ahora.getUTCHours() - 3;
    const dia = ahora.getUTCDay();
    
    if (dia === 0 || dia === 6) return false;
    return horaChile >= HORARIO_INICIO && horaChile < HORARIO_FIN;
}

// ========== MENSAJES ==========
function getMensajeFueraHorario() {
    return `📌 *Fuera de horario*

Hola 👋
Gracias por escribir a Recursos Humanos de *${EMPRESA}*.

🕘 Nuestro horario es:
*Lunes a Viernes de 08:00 a 18:00 hrs*

Te responderemos el próximo día hábil.

¡Gracias por tu paciencia! 🙌`;
}

function getMensajeBienvenida() {
    return `Hola 👋
*Bienvenido/a a Recursos Humanos de ${EMPRESA}*

Por favor, indícanos:

📌 *Nombre completo*
📌 *¿De cuál instalación vienes?*
📌 *Motivo de tu consulta*

¡Gracias! 😊`;
}

function getMensajeConfirmacion() {
    return `✅ *Hemos recibido tu solicitud*

¿Tu consulta es sobre información general?

Responde *SI* o *NO*`;
}

function getMenuInfoGeneral() {
    return `📋 *Información General - ${EMPRESA}*

Selecciona una opción:

1️⃣ Licencias médicas
2️⃣ Vacaciones
3️⃣ Liquidaciones de sueldo
4️⃣ Contrato o anexos
5️⃣ Otros

Responde con el *número* de tu opción ✍️`;
}

function getRespuestaOpcion(opcion) {
    const respuestas = {
        '1': `📌 *Licencias médicas*

Adjunta la foto o escaneo de tu licencia médica para derivarla al área correspondiente.`,
        
        '2': `📌 *Vacaciones*

Puedes revisar tu saldo de vacaciones en el sistema interno.
Para solicitar, usa el formulario interno de RRHH.`,
        
        '3': `📌 *Liquidaciones de sueldo*

Descarga tus liquidaciones desde el portal del colaborador.
Para períodos anteriores, indícanos qué meses necesitas.`,
        
        '4': `📌 *Contrato o anexos*

Indícanos tu RUT y qué documento necesitas.
Te lo enviaremos por el sistema interno.`,
        
        '5': `📌 *Otros*

Describe tu consulta con detalle y te responderemos a la brevedad.`
    };
    return respuestas[opcion] || '❌ Opción no válida. Responde 1, 2, 3, 4 o 5.';
}

function getMensajeCierre() {
    return `🌟 *¡Gracias por contactarnos!*

Esperamos haber ayudado con tu consulta.

*${EMPRESA}* agradece tu confianza.

¡Que tengas un excelente día! 😊`;
}

// ========== MANEJO DE CONVERSACIONES ==========
const estados = new Map();

// ========== PROCESAR MENSAJES ==========
client.on('message', async (message) => {
    try {
        if (message.fromMe) return;
        
        const contacto = await message.getContact();
        const numero = contacto.number;
        const cuerpo = message.body.trim().toLowerCase();
        const original = message.body.trim();
        
        console.log(`📩 Mensaje de ${numero}: ${original.substring(0, 40)}`);
        
        // Verificar horario
        if (!estaEnHorarioLaboral()) {
            await message.reply(getMensajeFueraHorario());
            return;
        }
        
        let estado = estados.get(numero) || 'inicio';
        
        // Comando de salida
        if (cuerpo === 'salir' || cuerpo === 'fin' || cuerpo === 'terminar') {
            estados.delete(numero);
            await message.reply(getMensajeCierre());
            return;
        }
        
        // Máquina de estados
        switch (estado) {
            case 'inicio':
                estados.set(numero, 'esperando_datos');
                await message.reply(getMensajeBienvenida());
                break;
                
            case 'esperando_datos':
                console.log(`📋 Datos guardados de ${numero}`);
                await message.reply(getMensajeConfirmacion());
                estados.set(numero, 'preguntando_si');
                break;
                
            case 'preguntando_si':
                if (cuerpo === 'si') {
                    estados.set(numero, 'esperando_opcion');
                    await message.reply(getMenuInfoGeneral());
                } else {
                    estados.delete(numero);
                    await message.reply("✅ Tu consulta ha sido registrada. Te responderemos a la brevedad.");
                }
                break;
                
            case 'esperando_opcion':
                if (/^[1-5]$/.test(cuerpo)) {
                    await message.reply(getRespuestaOpcion(cuerpo));
                    estados.delete(numero);
                    await message.reply(getMensajeCierre());
                } else {
                    await message.reply("❌ Por favor, responde con un número del 1 al 5.");
                }
                break;
                
            default:
                estados.set(numero, 'inicio');
                await message.reply(getMensajeBienvenida());
        }
        
    } catch (error) {
        console.error('❌ Error al procesar mensaje:', error);
        await message.reply('⚠️ Ocurrió un error. Por favor intenta nuevamente.');
    }
});

// ========== MANTENER VIVO ==========
process.on('SIGTERM', () => console.log('⚠️ SIGTERM recibido, el bot sigue funcionando...'));
process.on('SIGINT', () => console.log('⚠️ SIGINT recibido, el bot sigue funcionando...'));

// ========== INICIAR ==========
client.initialize();
console.log('💡 El QR aparecerá en la URL /qr cuando esté listo...');