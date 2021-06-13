var Scriptdb = require('script.db');

var newAPI = require('../api');
var api = new newAPI()

module.exports = {
    name: "playtime",
    aliases: ['pt'],
    
    async execute(client, message, args) {
        if (!args[0]) return message.channel.send(client.userNotFound).then(msg => msg.delete(60000));;

		let pt = new Scriptdb(`${client.config.disk}/data/playtime/${args[0]}.json`);
		let playtime = pt.get('time')
		
		if (playtime === undefined) return message.channel.send(client.userNotFound).then(msg => msg.delete(60000));;
    
		message.channel.send({ embed: {
			color: 0x2EA711,
			description: args[0] + ": " + api.playtimeCalc(playtime)
		}}).catch(e => { 
			message.author.send("**Lỗi:** " + e.toString() + ". Hãy báo cáo cho " + client.authorID + ".") 
		}).then(msg => msg.delete(60000));
    }
}