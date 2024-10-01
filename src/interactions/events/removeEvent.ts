import { Interaction, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export const handleRemoveButtonInteraction = async (interaction: Interaction) => {
    if (!interaction.isButton() || interaction.customId !== 'remove') return;
  
    const message = interaction.message;
    const content = message.content;
  
    // Extract slot list from the message content
    const slotListMatch = content.match(/Slot #\d+ - <t:\d+:F>:[^\n]*/g);
    const slotList = slotListMatch ? slotListMatch : [];
  
    // Extract user mention
    const userMention = `<@!${interaction.user.id}>`;
  
    // Generate buttons for each slot that has space left
    const rows = [];
    let currentRow = new ActionRowBuilder<ButtonBuilder>();
  
    for (let i = 0; i < slotList.length; i++) {
      const slot = slotList[i];
      if (slot.includes(userMention)) {
        const button = new ButtonBuilder()
          .setCustomId(`removeSlot_${i}_${message.id}`)
          .setLabel(`Slot ${i + 1}`)
          .setStyle(ButtonStyle.Danger);
        currentRow.addComponents(button);
      }
      
      // If the current row has 5 buttons, push it to rows and start a new row
      if (currentRow.components.length === 5) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder<ButtonBuilder>();
      }
    }
  
    // Push the last row if it has any buttons
    if (currentRow.components.length > 0) {
      rows.push(currentRow);
    }
  
    if (rows.length > 0) {
      await interaction.reply({ content: 'Select a slot to remove yourself from:', components: rows, ephemeral: true });
    } else {
      await interaction.reply({ content: 'You are not signed up for any slots.', ephemeral: true });
    }
  };
  
  export const handleSlotRemovalInteraction = async (interaction: Interaction) => {
    if (!interaction.isButton() || !interaction.customId.startsWith('removeSlot_')) return;
  
    const [_, slotIndexStr, originalMessageId] = interaction.customId.split('_');
    const slotIndex = parseInt(slotIndexStr, 10);
  
    // Defer the interaction to give us more time to process
    await interaction.deferReply({ ephemeral: true });
  
    // Fetch the original message
    const originalMessage = await interaction.channel?.messages.fetch(originalMessageId);
    if (!originalMessage) {
      await interaction.followUp({ content: 'Original message not found.', ephemeral: true });
      return;
    }
  
    const content = originalMessage.content;
  
    // Extract slot list from the message content
    const slotListMatch = content.match(/Slot #\d+ - <t:\d+:F>:[^\n]*/g);
    const slotList = slotListMatch ? slotListMatch : [];
  
    // Ensure the slot index is within bounds
    if (slotIndex < 0 || slotIndex >= slotList.length) {
      await interaction.followUp({ content: 'Invalid slot selected.', ephemeral: true });
      return;
    }
  
    // Check if the user is signed up for the specific slot
    const userMention = `<@!${interaction.user.id}>`;
    const slot = slotList[slotIndex];
    if (!slot.includes(userMention)) {
      await interaction.followUp({ content: 'You are not signed up for this slot.', ephemeral: true });
      return;
    }
  
    // Remove the user from the slot
    const updatedSlot = slot.replace(userMention, '').trim();
  
    // Update the slot list with the removal
    slotList[slotIndex] = updatedSlot;
  
    // Update the message content by replacing the specific slot line
    const updatedContent = content.replace(slot, updatedSlot);
  
    await originalMessage.edit({ content: updatedContent });
  
    await interaction.followUp({ content: `You have been removed from slot ${slotIndex + 1}.`, ephemeral: true });
  };