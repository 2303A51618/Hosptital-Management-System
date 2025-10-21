import twilio from 'twilio';
import { env } from '../config/env.js';

let client;
if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
  client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
}

export const sendSMS = async (to, body) => {
  if (!client || !env.TWILIO_FROM) return;
  await client.messages.create({ from: env.TWILIO_FROM, to, body });
};
