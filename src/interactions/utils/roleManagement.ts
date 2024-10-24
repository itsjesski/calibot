import { Interaction, GuildMemberRoleManager } from "discord.js";

export function userIsManager(interaction: Interaction) {
    const memberRoles = interaction.member?.roles;
    if (
      memberRoles instanceof GuildMemberRoleManager &&
      memberRoles.cache.has(process.env.MANAGER_ROLE_ID as string)
    ) {
      return true;
    }
    return false;
  }