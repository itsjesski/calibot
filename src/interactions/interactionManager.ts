import * as dotenv from 'dotenv';
import { GuildMemberRoleManager, Interaction } from 'discord.js';
import config from '../config.json';
import {
  handleCreateEvent,
  handleCreateEventModalSubmit,
} from './events/createEvent';
import { handleEditButtonInteraction } from './events/editEvent';
import {
  handleRemoveButtonInteraction,
  handleSlotRemovalInteraction,
} from './events/removeEvent';
import {
  handleSignUpButtonInteraction,
  handleSlotSelectionInteraction,
} from './events/signupEvent';

dotenv.config();

function userIsManager(interaction: Interaction) {
  const memberRoles = interaction.member?.roles;
  if (
    memberRoles instanceof GuildMemberRoleManager &&
    memberRoles.cache.has(process.env.MANAGER_ROLE_ID as string)
  ) {
    return true;
  }
  return false;
}

async function managerFunctions(interaction: Interaction) {
  try {
    // Commands
    if (interaction.isCommand()) {
      if (interaction.commandName === 'event') {
        await handleCreateEvent(interaction);
        return;
      }
    }

    // Buttons
    if (interaction.isButton()) {
      if (interaction.customId.startsWith('edit')) {
        await handleEditButtonInteraction(interaction);
        return;
      }
    }

    // Modals
    if (interaction.isModalSubmit()) {
      await handleCreateEventModalSubmit(interaction);
      return;
    }
  } catch (error) {
    console.error('Error handling manager interaction:', error);
    if (interaction.isRepliable()) {
      await interaction.reply({
        content: 'There was an error while handling this interaction.',
        ephemeral: true,
      });
    }
  }
}

async function everyoneFunctions(interaction: Interaction) {
  try {
    // Buttons
    if (interaction.isButton()) {
      if (interaction.customId === 'signUp') {
        await handleSignUpButtonInteraction(interaction);
      } else if (interaction.customId.startsWith('signUpSlot_')) {
        await handleSlotSelectionInteraction(interaction);
      } else if (interaction.customId === 'remove') {
        await handleRemoveButtonInteraction(interaction);
      } else if (interaction.customId.startsWith('removeSlot_')) {
        await handleSlotRemovalInteraction(interaction);
      }
    }
  } catch (error) {
    console.error('Error handling everyone interaction:', error);
    if (interaction.isRepliable()) {
      await interaction.reply({
        content: 'There was an error while handling this interaction.',
        ephemeral: true,
      });
    }
  }
}

export const interactionManager = async (interaction: Interaction) => {
  // Check to see if we should load manager items.
  if (userIsManager(interaction)) {
    await managerFunctions(interaction);
    await everyoneFunctions(interaction);
    return;
  }

  // Any user can use these items.
  await everyoneFunctions(interaction);
};
