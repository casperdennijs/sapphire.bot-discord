const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { openAIKey } = require('../../config.json');
const { OpenAI } = require('openai');

const openai = new OpenAI({
	apiKey: openAIKey,
});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ask')
		.setDescription('Ask a question to Sapphire')
		.addStringOption(option =>
			option.setName('question')
				.setDescription('Sapphire provides you with an answer')
				.setRequired(true)),
	async execute(interaction) {
		const user = interaction.user.globalName;
		const question = interaction.options.getString('question') ?? 'No reason provided';
		await interaction.deferReply();

        try {
            const conversationLog = [
                { role: 'system', content: 'You are a friendly chatbot.' },
                { role: 'user', content: question },
            ];

            const result = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: conversationLog,
                max_tokens: 400,
            });

            const embedAnswer = new EmbedBuilder()
                .setColor(0x93C47D)
                .setTitle(`${question}`)
                .setAuthor({ name: 'Sapphire', iconURL: `${interaction.client.user.avatarURL()}`, url: 'https://sapphire.bot' })
                .setDescription(`${result.choices[0].message.content}`)
                .setFooter({ text: `Requested by ${user}` });

            await interaction.editReply({ embeds: [embedAnswer] });
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