const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { openAIKey } = require('../../config.json');
const { OpenAI } = require('openai');

const openai = new OpenAI({
	apiKey: openAIKey,
});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('image')
		.setDescription('Ask Sapphire to make an image')
		.addStringOption(option =>
			option.setName('prompt')
				.setDescription('Sapphire provides you with an image')
				.setRequired(true)),
	async execute(interaction) {
		const user = interaction.user.globalName;
		const prompt = interaction.options.getString('prompt') ?? 'No reason provided';
        await interaction.deferReply();

        try {
            const result = await openai.images.generate({
                model: "dall-e-3",
                prompt: `${prompt}`,
                n: 1,
                size: "1024x1024",
            });

            image_url = result.data[0].url;

            const embedImage = new EmbedBuilder()
                .setColor(0x93C47D)
                .setTitle(`${prompt}`)
                .setAuthor({ name: 'Sapphire', iconURL: `${interaction.client.user.avatarURL()}`, url: 'https://sapphire.bot' })
                .setImage(image_url)
                .setFooter({ text: `Requested by ${user}` });

            await interaction.editReply({ embeds: [embedImage] });
        } catch(error) {
            if (error.response) {
                console.log(error.response.status);
                console.log(error.response.data);
            } else {
                console.log(error.message);

                const embedError = new EmbedBuilder()
                    .setColor(0xE06666)
                    .setTitle(`Error`)
                    .setDescription(`${error.message}`)

                await interaction.editReply({ embeds: [embedError] });
            }
        }
	},
};