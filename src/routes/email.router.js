import express from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import twilio from 'twilio';

const router = express.Router();

const transport = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  auth: {
    user: 'mbotheatoz@gmail.com',
    pass: 'google gmail key',
  },
});

router.get('/', async (req, res) => {
  try {
    const filePath = path.resolve('./src/public/img/vinilo.png');
    console.log(`Attachment path: ${filePath}`);
    await transport.sendMail({
      from: 'Marilyn Botheatoz <mbotheatoz@gmail.com>',
      to: 'mbotheatoz@gmail.com',
      subject: 'Correo de prueba',
      html: `<h1>Gracias por tu compra!</h1>
             <img src="cid:vinilo" />`,
      attachments: [
        {
          filename: 'vinilo.png',
          path: filePath,
          cid: 'vinilo',
        },
      ],
    });
    res.send('Correo enviado con éxito');
  } catch (error) {
    console.error(`Error al enviar el correo: ${error.message}`);
    res.status(500).send(`Error al enviar el correo: ${error.message}`);
  }
});

router.post('/enviarmensaje', async (req, res) => {
  const { email, message } = req.body;
  try {
    await transport.sendMail({
      from: 'Marilyn Botheatoz <mbotheatoz@gmail.com>',
      to: email,
      subject: 'TEST',
      text: message,
    });
    res.send('Correo enviado');
  } catch (error) {
    res.status(500).send('Error al enviar el mensaje!');
  }
});

/* TWILIO INTEGRATION */

const twilioAccountID = 'AC...';
const twilioAuthToken = '...';
const twilioPhoneNumber = '...';
const client = twilio(twilioAccountID, twilioAuthToken, twilioPhoneNumber);

router.get('/sms', async (req, res) => {
  try {
    await client.messages.create({
      body: 'Tu pedido ya está listo, puedes venir a retirarlo',
      from: twilioPhoneNumber,
      to: '+541135932226',
    });
    res.send('SMS enviado con éxito');
  } catch (error) {
    res.status(500).send('Error al enviar el SMS');
  }
});

export default router;
