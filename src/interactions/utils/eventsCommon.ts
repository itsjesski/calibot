import { Interaction, ButtonBuilder, ButtonStyle, GuildMemberRoleManager, ActionRowBuilder } from "discord.js";

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
      memberRoles.cache.has(process.env.MANAGER_ROLE_ID as string)
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
  