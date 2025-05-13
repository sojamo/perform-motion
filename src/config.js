import dotenv from 'dotenv';
dotenv.config();

export default {
  wsPort:     +process.env.WS_PORT || 4000,
  oscPort:    +process.env.OSC_PORT|| 12000,
  oscHost:    process.env.OSC_HOST || '127.0.0.1',
};