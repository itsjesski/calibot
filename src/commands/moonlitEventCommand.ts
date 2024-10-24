import { SlashCommandBuilder } from 'discord.js';

export const createMoonlitEventCommand = new SlashCommandBuilder()
  .setName('moonlit')
  .setDescription('Create a new Moonlit Academy event')
  .addStringOption((option) =>
    option
      .setName('starttime')
      .setDescription('The start time of the event')
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('dj')
      .setDescription('The name of the DJ who is mixing')
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('leader')
      .setDescription('Person in charge of the coordination')
      .setRequired(false),
  );