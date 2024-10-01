import { Client, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import { interactionManager } from './interactions/interactionManager';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once('ready', () => {
  console.log('Calibot is online!');
});

client.on('interactionCreate', async (interaction) => {
  await interactionManager(interaction);
});

client.login(process.env.DISCORD_TOKEN);