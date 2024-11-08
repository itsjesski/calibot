import {
  Interaction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import { chunkArray } from './generalUtilities';

export const handleSignUpButtonInteraction = async (
  interaction: Interaction,
) => {
  if (!interaction.isButton() || interaction.customId !== 'signUp') return;

  const message = interaction.message;
  const content = message.content;

  // Extract slot list from the message content
  const slotListMatch = content.match(/Slot #\d+ - <t:\d+:F>:[^\n]*/g);
  const slotList = slotListMatch ? slotListMatch : [];

  // Extract people per slot limit
  const peoplePerSlotMatch = content.match(/with (\d+) people per slot/);
  const peoplePerSlot = peoplePerSlotMatch
    ? parseInt(peoplePerSlotMatch[1], 10)
    : 0;

  // Generate buttons for each slot that has space left
  const rows = [];
  let currentRow = new ActionRowBuilder<ButtonBuilder>();

  for (let i = 0; i < slotList.length; i++) {
    const slot = slotList[i];
    const signUps = (slot.match(/<@!\d+>/g) || []).length;
    if (signUps < peoplePerSlot) {
      const button = new ButtonBuilder()
        .setCustomId(`signUpSlot_${i}_${message.id}`)
        .setLabel(`Slot ${i + 1}`)
        .setStyle(ButtonStyle.Primary);

      currentRow.addComponents(button);

      // If the current row has 5 buttons, push it to rows and start a new row
      if (currentRow.components.length === 5) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder<ButtonBuilder>();
      }
    }
  }

  // Push the last row if it has any buttons
  if (currentRow.components.length > 0) {
    rows.push(currentRow);
  }

  if (rows.length > 0) {
    const chunkedRows = chunkArray(rows, 5);

    await interaction.reply({
      components: chunkedRows[0],
      ephemeral: true,
    });

    for (let i = 1; i < chunkedRows.length; i++) {
      await interaction.followUp({
        components: chunkedRows[i],
        ephemeral: true,
      });
    }
  } else {
    await interaction.reply({
      content: 'All slots are full.',
      ephemeral: true,
    });
  }
};

export const handleSlotSelectionInteraction = async (
  interaction: Interaction,
) => {
  if (
    !interaction.isButton() ||
    !interaction.customId.startsWith('signUpSlot_')
  )
    return;

  const [_, slotIndexStr, originalMessageId] = interaction.customId.split('_');
  const slotIndex = parseInt(slotIndexStr, 10);

  // Defer the interaction to give us more time to process
  await interaction.deferReply({ ephemeral: true });

  // Fetch the original message
  const originalMessage =
    await interaction.channel?.messages.fetch(originalMessageId);
  if (!originalMessage) {
    await interaction.followUp({
      content: 'Original message not found.',
      ephemeral: true,
    });
    return;
  }

  const content = originalMessage.content;

  // Extract slot list from the message content
  const slotListMatch = content.match(/Slot #\d+ - <t:\d+:F>:[^\n]*/g);
  const slotList = slotListMatch ? slotListMatch : [];

  // Extract people per slot limit
  const peoplePerSlotMatch = content.match(/with (\d+) people per slot/);
  const peoplePerSlot = peoplePerSlotMatch
    ? parseInt(peoplePerSlotMatch[1], 10)
    : 0;

  // Ensure the slot index is within bounds
  if (slotIndex < 0 || slotIndex >= slotList.length) {
    await interaction.followUp({
      content: 'Invalid slot selected.',
      ephemeral: true,
    });
    return;
  }

  // Check if the user is already signed up for the specific slot
  const userMention = `<@!${interaction.user.id}>`;
  const slot = slotList[slotIndex];
  if (slot.includes(userMention)) {
    await interaction.followUp({
      content: 'You are already signed up for this slot.',
      ephemeral: true,
    });
    return;
  }

  // Check if the slot has space left
  const signUps = (slot.match(/<@!\d+>/g) || []).length;
  if (signUps < peoplePerSlot) {
    // Sign the user up for the slot by adding their Discord mention
    const updatedSlot = `${slot} ${userMention}`;

    // Update the slot list with the new sign-up
    slotList[slotIndex] = updatedSlot;

    // Update the message content by replacing the specific slot line
    const updatedContent = content.replace(slot, updatedSlot);

    await originalMessage.edit({ content: updatedContent });

    await interaction.followUp({
      content: `You have signed up for slot ${slotIndex + 1}.`,
      ephemeral: true,
    });
  } else {
    await interaction.followUp({
      content: 'This slot is full.',
      ephemeral: true,
    });
  }
};
