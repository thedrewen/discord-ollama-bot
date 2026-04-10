import { ApplicationIntegrationType, ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from "discord.js";
import { CommandDefinition } from "../../type";

const cmd : CommandDefinition = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .setDescription('Pong again!'),
    async execute(interaction) {
        await interaction.reply('Pong !');
    }
}

export default cmd;