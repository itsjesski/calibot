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
import config from '../../config.json';
import { getEventTemplate } from '../utils/eventTemplate';

export const handleCreateEvent = async (
  interaction: CommandInteraction<CacheType>,
) => {
  if (!interaction.isCommand()) return;

  const options =
    interaction.options as CommandInteractionOptionResolver<CacheType>;
  const startTimeUnix = options.getString('starttime', true);
  const slots = options.getInteger('slots', true);
  const peoplePerSlot = options.getInteger('peopleperslot', true);
  const duration = options.getInteger('duration', true);
  const description = options.getString('description') || '[DESCRIPTION HERE]';
  const eventTitle = options.getString('title') || '[TITLE HERE]';

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
  const template = getEventTemplate(
    eventTitle,
    startTimeUnix,
    slots,
    peoplePerSlot,
    duration,
    description,
    slotList,
  );

  const modal = new ModalBuilder()
    .setCustomId('createEventModal')
    .setTitle('Create Event');

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

export const handleCreateEventModalSubmit = async (
  interaction: Interaction,
) => {
  if (!interaction.isModalSubmit()) return;

  const template = interaction.fields.getTextInputValue('template');

  // Create buttons
  const signUpButton = new ButtonBuilder()
    .setCustomId('signUp')
    .setLabel('Sign Up')
    .setStyle(ButtonStyle.Primary);

  const removeButton = new ButtonBuilder()
    .setCustomId('remove')
    .setLabel('Remove')
    .setStyle(ButtonStyle.Danger);

  const buttons = [signUpButton, removeButton];

  // Check if the user has the required role to see the edit button
  const memberRoles = interaction.member?.roles;
  if (
    memberRoles instanceof GuildMemberRoleManager &&
    memberRoles.cache.has(config.managerRoleId)
  ) {
    const editButton = new ButtonBuilder()
      .setCustomId('edit')
      .setLabel('Edit')
      .setStyle(ButtonStyle.Secondary);
    buttons.push(editButton);
  }

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

  if (interaction.customId === 'createEventModal') {
    await interaction.reply({ content: template, components: [row] });
  } else if (interaction.customId === 'editEventModal') {
    await interaction.deferUpdate();
    await interaction.editReply({ content: template, components: [row] });
  }
};
