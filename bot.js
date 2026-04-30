// bot.js - Bot de WhatsApp para Grupo Euskadi - Versión COMPLETA
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Servidor web para mantener vivo el bot
app.get('/', (req, res) => {
    res.send('🤖 Bot de WhatsApp - Grupo Euskadi - Funcionando');
});

app.listen(PORT, () => {
    console.log(`🌐 Servidor web activo en puerto ${PORT}`);
});

// ========== CONFIGURACIÓN ==========
const HORARIO_INICIO = 8;
const HORARIO_FIN = 18;
const EMPRESA = "Grupo Euskadi";

// Estados de conversación
const estados = new Map();
const ESTADOS = {
    INICIO: 'inicio',
    ESPERANDO_DATOS: 'esperando_datos',
    ESPERANDO_OPCION: 'esperando_opcion'
};

// ========== INICIALIZAR CLIENTE ==========
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// ========== QR ==========
client.on('qr', (qr) => {
    console.log('🔐 ESCANEA ESTE QR CON WHATSAPP:');
    qrcode.generate(qr, { small: true });
});

// ========== BOT CONECTADO ==========
client.on('ready', () => {
    console.log(`✅ Bot de WhatsApp - ${EMPRESA} - Conectado correctamente`);
    console.log(`📅 Horario: Lunes a Viernes de ${HORARIO_INICIO}:00 a ${HORARIO_FIN}:00 hrs`);
});

// ========== VERIFICAR HORARIO ==========
function estaEnHorarioLaboral() {
    const ahora = new Date();
    const hora = ahora.getHours();
    const dia = ahora.getDay();
    if (dia === 0 || dia === 6) return false;
    return hora >= HORARIO_INICIO && hora < HORARIO_FIN;
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
    return `✅ Hemos recibido tu solicitud correctamente.

Nuestro equipo la revisará y te responderá pronto.

¿Tu consulta es sobre información general? (responde SI o NO)`;
}

function getMenuInfoGeneral() {
    return `📌 Información General - ${EMPRESA}

Indícanos el motivo:

1️⃣ Licencias médicas
2️⃣ Vacaciones
3️⃣ Liquidaciones de sueldo
4️⃣ Contrato o anexos
5️⃣ Otros

Responde con el número ✍️`;
}

function getRespuestaOpcion(opcion) {
    const respuestas = {
        '1': `📌 *Licencias médicas*

Adjunta la licencia médica (foto o escaneo) y la derivaremos al área correspondiente.`,
        
        '2': `📌 *Vacaciones*

Puedes revisar tu saldo en el sistema interno.
Para solicitar, usa el formulario interno.`,
        
        '3': `📌 *Liquidaciones de sueldo*

Descarga tus liquidaciones desde el portal del colaborador.`,
        
        '4': `📌 *Contrato o anexos*

Indícanos tu RUT y qué documento necesitas.`,
        
        '5': `📌 *Otros*

Describe tu consulta con detalle y te responderemos.`
    };
    return respuestas[opcion] || `Opción no válida. Responde 1, 2, 3, 4 o 5.`;
}

function getMensajeCierre() {
    return `📌 *Cierre*

Esperamos haber resuelto tu consulta 😊

*${EMPRESA}* agradece tu contacto.

¡Excelente día! 🌟`;
}

// ========== PROCESAR MENSAJES ==========
client.on('message', async (message) => {
    try {
        const contacto = await message.getContact();
        const numero = contacto.number;
        const cuerpo = message.body.trim().toLowerCase();
        const original = message.body.trim();

        console.log(`📩 Mensaje de ${numero}: ${original.substring(0, 50)}`);

        // Fuera de horario
        if (!estaEnHorarioLaboral()) {
            await message.reply(getMensajeFueraHorario());
            return;
        }

        let estado = estados.get(numero) || ESTADOS.INICIO;

        // Comando salir
        if (cuerpo === 'salir' || cuerpo === 'fin') {
            estados.delete(numero);
            await message.reply(getMensajeCierre());
            return;
        }

        if (estado === ESTADOS.INICIO) {
            estados.set(numero, ESTADOS.ESPERANDO_DATOS);
            await message.reply(getMensajeBienvenida());

        } else if (estado === ESTADOS.ESPERANDO_DATOS) {
            console.log(`📋 Datos: ${original}`);
            await message.reply(getMensajeConfirmacion());
            estados.set(numero, 'preguntando_si');

        } else if (estado === 'preguntando_si') {
            if (cuerpo === 'si') {
                estados.set(numero, ESTADOS.ESPERANDO_OPCION);
                await message.reply(getMenuInfoGeneral());
            } else {
                estados.delete(numero);
                await message.reply("Perfecto, tu consulta ha sido registrada.");
            }

        } else if (estado === ESTADOS.ESPERANDO_OPCION && /^[1-5]$/.test(cuerpo)) {
            await message.reply(getRespuestaOpcion(cuerpo));
            estados.delete(numero);
            await message.reply(getMensajeCierre());

        } else if (estado === ESTADOS.ESPERANDO_OPCION) {
            await message.reply("Responde con un número del 1 al 5.");
        }

    } catch (error) {
        console.error('❌ Error:', error);
        await message.reply('Ocurrió un error. Intenta nuevamente.');
    }
});

// ========== INICIAR ==========
client.on('qr', (qr) => {
    console.log('🔐 ESCANEA ESTE QR CON WHATSAPP:');
    console.log(qr);  // Esto muestra el QR como texto plano
    console.log('📱 Escanéalo con WhatsApp antes de que expire');
});