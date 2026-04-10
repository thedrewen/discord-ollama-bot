import { ApplicationIntegrationType, InteractionContextType, MessageFlags, SlashCommandBuilder } from "discord.js";
import { CommandDefinition } from "../../type";
import ollama from "../../services/ollama";

const cmd: CommandDefinition = {
    data: new SlashCommandBuilder()
        .setName('prompt')
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .addStringOption((option) => option
            .setName('content')
            .setDescription('Your prompt.')
            .setRequired(true)
            .setMaxLength(500)
        )
        .setDescription('Send to bot your prompt.'),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            const content = interaction.options.getString('content', true);
            let response = `**<@${interaction.user.id}> :** *${content}*\n\n**<@${interaction.client.user.id}> :** *«`;
            if (ollama.isRunning) {
                ollama.addInteractionId(interaction.id, interaction.user.displayName, content);
                let inter;
                await new Promise((res) => {
                    inter = setInterval(async () => {
                        const place = ollama.fetchPlaceToInteractionId(interaction.id);
                        if (place == 0) {
                            res(0);
                        } else {
                            await interaction.editReply({ content: `The bot is currently being generated for another user. Please wait... (Your place in the queue: ${place}) ⚙️` });
                        }
                    }, 1000);
                });

                clearInterval(inter);

                await interaction.editReply({content: `<@${interaction.client.user.id}> thinking...`});

                response += await ollama.fetchResponse(interaction.id);
            } else {
                response += await ollama.ask(interaction.user.displayName, content);
            }
            
            interaction.editReply({content: response+'»*'}); 

        } catch (error) {
            console.log('Error for command ! ' + interaction.user.id + ' ' + interaction.user.displayName + ' error: '+error);
        }
    }
}

export default cmd;