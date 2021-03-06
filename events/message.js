const { Client, Message, MessageEmbed, Collection } = require('discord.js');
const Database = require('simplest.db');
const ms = require("ms");
const config = require("../config.json");
const a = require('../api');
const api = new a();
const timeout = new Collection();
require('dotenv');

module.exports = {
    name: "message",

    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @returns 
     */
    execute(client, message) {
        if(message.author.bot || message.channel.type == "dm") return;

        let dataPrefix = new Database({path: "./prefix.json"}).get(message.author.id + ".prefix");

        const prefix = dataPrefix || config.PREFIX;
        
        if(message.content == "<@" + client.user.id + ">" || message.content == "<@!" + client.user.id + ">") return message.lineReplyNoMention({embed: {
            description: "Prefix của bạn là ``" + prefix + "``.",
            color: config.DEF_COLOR
        }}).then(msg => msg.delete({timeout:60000}));

        let regex = /[a-z]|[A-Z]/ig;

        if(message.content.split(" ")[0].match(regex)) {
            if(!message.content.toLowerCase().startsWith(prefix) || !message.content.toLowerCase().startsWith(prefix)) return;
        } else {
            if(!message.content.startsWith(prefix) || !message.content.startsWith(prefix)) return;
        }

        console.log(`[${new Date().toLocaleString()}] Guild: ${message.guild.name} || Channel: ${message.channel.name} || Usage: ${message.author.tag} - ${message.author.id}\nMessage: ${message.content}`);

        var args = message.content.slice(prefix.length).split(/ +/);
        
        if(args[0] == "") args = args.slice(1);
        if(!args.length) return;

        const cmdName = args.shift().toLowerCase();

        const cmd = client.commands.get(cmdName)
            || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));

        if(!cmd) return;

        client.userNotFound = new MessageEmbed()
                        .setDescription('Không tìm thấy người chơi.')
                        .setColor(0xC51515);

        client.inputUsername = new MessageEmbed()
                        .setDescription('Bạn phải cung cấp tên người chơi.\n\nCú pháp: ``' + prefix + cmdName + " <USERNAME>``")
                        .setColor(0xC51515);


        client.prefix = prefix;
        client.disk = process.env.disk;
        client.config = config;
        client.footer = config.FOOTER;

        message.channel.startTyping();
	
        if (cmd.vote) {
            let checkVote = new Database({path:process.env.disk + '/voted.json'}).get(message.author.id);

            if ((!checkVote || Date.now() - checkVote > ms("2d")) && config.ADMINS.indexOf(message.author.id) < 0)
                return message.lineReplyNoMention( "Bạn phải vote bot để sử dụng lệnh này.\n\nVote tại: https://top.gg/bot/768448728125407242/vote")
                    .then(msg => { msg.delete({timeout: 60000}); message.channel.stopTyping() });
        }
        
        if(cmd.disabled && config.ADMINS.indexOf(message.author.id) == -1) return;
        if(cmd.admin && config.ADMINS.indexOf(message.author.id) < 0) return;

        if(cmd.delay) {
            let cmdDelay = client.commands.get(cmdName);
            if(!cmdDelay) cmdDelay = client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));

            if(timeout.get(`${message.author.id}.${cmdDelay.name}`) - Date.now() < 0 || !timeout.get(`${message.author.id}.${cmdDelay.name}`)) timeout.delete(`${message.author.id}.${cmdDelay.name}`); 

            let calc = api.calculate(timeout.get(`${message.author.id}.${cmdDelay.name}`) - Date.now());
            
            if(timeout.get(`${message.author.id}.${cmdDelay.name}`) && calc) return message.lineReplyNoMention({embed: {
                description: `Hãy chờ \`\`${calc}\`\` để tiếp tục dùng lệnh này.`,
                color: config.ERR_COLOR
            }}).then(msg => {
                message.channel.stopTyping();
                msg.delete({timeout: 60000});
            });

            setTimeout(() => timeout.delete(`${message.author.id}.${cmdDelay.name}`), cmdDelay.delay * 1000);
            timeout.set(`${message.author.id}.${cmdDelay.name}`, Date.now() + cmdDelay.delay * 1000);
        }

        var blacklistData = new Database({path:'./blacklist.json'});
 
        if(cmd.name !== "blacklist" && blacklistData.get('users').indexOf(message.author.id) > -1 && config.ADMINS.indexOf(message.author.id) < 0) return message.lineReplyNoMention({embed: {
            description: "Bạn có trong danh sách đen nên không thể dùng bot.", color: config.ERR_COLOR
        }}).then(msg => {
            message.channel.stopTyping();
            msg.delete({timeout: 60000});
        });
        

        try{
            cmd.execute(client, message, args);
            setTimeout(() => {
                message.channel.stopTyping();
            }, 2000);
        }catch(err) {
            console.log(err);
            message.channel.stopTyping();
        }
    }
}