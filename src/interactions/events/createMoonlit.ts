import * as dotenv from 'dotenv';
import {
    Interaction,
    CommandInteractionOptionResolver,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    GuildMemberRoleManager,
    CacheType,
    CommandInteraction,
  } from 'discord.js';
  import { getMoonlitTemplate } from '../utils/templates/moonlitTemplate';
  dotenv.config();

  export const handleMoonlitEvent = async (
    interaction: CommandInteraction<CacheType>,
  ) => {
    if (!interaction.isCommand()) return;
  
    const options =
      interaction.options as CommandInteractionOptionResolver<CacheType>;
    const startTimeUnix = options.getString('starttime', true);
    const slots = 4;
    const duration = 15;
    const dj = options.getString('dj', true);
    const leader = options.getString('leader', true);
  
    // Generate slot timestamps
    const slotTimestamps = [];
    for (let i = 0; i < slots; i++) {
      const slotStartTime = Number(startTimeUnix) + i * duration * 60;
      slotTimestamps.push(`<t:${Math.floor(slotStartTime)}:F>`);
    }
  
    // Create a list of slots with timestamps
    const slotList = slotTimestamps
      .map((timestamp, index) => `Slot #${index + 1} - ${timestamp}:`)
      .join('\n');
  
    // Pre-built template
    const template = getMoonlitTemplate(
        startTimeUnix,
        dj,
        leader,
        slotList,
    );
  
    const modal = new ModalBuilder()
      .setCustomId('createEventModal')
      .setTitle('Create Moonlit Event');
  
    const templateInput = new TextInputBuilder()
      .setCustomId('template')
      .setLabel('Event Details')
      .setStyle(TextInputStyle.Paragraph)
      .setValue(template)
      .setRequired(true);
  
    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(templateInput),
    );
  
    await interaction.showModal(modal);
  };