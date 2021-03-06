var Scriptdb = require('script.db');
var { MessageEmbed } = require('discord.js');

module.exports = {
    name: "stats",
    description: "Xem thông số người chơi",
    aliases: ['kd', 'stats'],
    delay: 10,
    vote: true,
    
    execute(client, message, args) {
        if (!args[0]) return message.lineReplyNoMention(client.inputUsername).then(msg => msg.delete({timeout: 60000}));

		const kd = new Scriptdb(`${client.disk}/data/kd/${args[0]}.json`);
		let deads = kd.get('deaths');
		let kills = kd.get('kills');

		if (kills === undefined && deads == undefined) return message.lineReplyNoMention(client.userNotFound).then(msg => msg.delete({timeout: 60000}));
        
        if(kills == undefined) kills = 0;
        if(deads == undefined) deads = 0;
        
		var ratio = kills / deads;
		var ratioFixed = ratio.toFixed(2);

		if (ratioFixed === "NaN" || ratioFixed === "Infinity") {
			ratioFixed = "0.00";
		}

        var embed = new MessageEmbed()
                        .setAuthor(`Chỉ số của ${args[0]}`, `https://minotar.net/helm/${args[0]}`, `https://namemc.com/` + args[0])
                        .addField(`Giết`, `${Intl.NumberFormat().format(kills)}`, true)
                        .addField(`Chết`, `${Intl.NumberFormat().format(deads)}`, true )
                        .addField(`Tỉ số`, `${ratioFixed}`, true )
                        .setThumbnail(`https://minotar.net/helm/${args[0]}`)
                        .setColor(0x2EA711)
                        .setFooter(client.footer, 'https://cdn.discordapp.com/avatars/768448728125407242/f18ec971961b23db96e6cf0f3f79ec1c.png?size=256')
                        .setTimestamp();

        message.lineReplyNoMention(embed).then(msg => msg.delete({timeout: 60000}));
    }
}