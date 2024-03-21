require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');

// Constants
const CHANNEL_ID = process.env.CHANNEL;
const MAX_SESSION_TIME_MINUTES = 30;

// List of responses
const madDogResponses = ["grrrr", "*growls*", "*snarls*", "boof! *angrily*"];
const happyDogResponses = ["*wags tail*", "*does spinnies*", "boof!", "woof!"];

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

// Define a function for pee reminder
function peeReminder(channel) {
    if (channel) {
        channel.send(`**Take mocha outside** [She's been playing for ${MAX_SESSION_TIME_MINUTES} minutes, she has to peepee!]`);
    } else {
        console.error("Channel not found");
    }
}

let intervalId = null;
let initialDelayPassed = false; // Flag to track if the initial delay has passed

function play(message) {
    if (playing.is_playing) {
        message.channel.send("**Playtime is already happening!**");
        return;
    }

    playing.is_playing = true;
    playing.start_time = new Date().getTime();
    const humanReadableTime = new Date(playing.start_time).toLocaleTimeString();
    message.channel.send(`Started *playing and having fun* at ${humanReadableTime}`);

    // Start the interval for pee reminders after the initial delay
    setTimeout(() => {
        peeReminder(message.channel);
        intervalId = setInterval(() => peeReminder(message.channel), MAX_SESSION_TIME_MINUTES * 60 * 1000);
        initialDelayPassed = true; // Set the flag to true after the initial delay
    }, MAX_SESSION_TIME_MINUTES * 60 * 1000);
}

function stop(message) {
    if (!playing.is_playing) {
        const response = madDogResponses[Math.floor(Math.random() * madDogResponses.length)];
        message.channel.send(response);
        return;
    }

    playing.is_playing = false;
    const stopTime = new Date().getTime();
    const humanReadableStop = new Date(stopTime).toLocaleTimeString();
    clearInterval(intervalId); // Stop the interval for pee reminders
    message.channel.send(`Stopped *playing and having fun* at ${humanReadableStop}`);
}

client.on('ready', () => {
    console.log(`${client.user.tag} is online`);
    const channel = client.channels.cache.get(CHANNEL_ID);
    if (channel) {
        channel.send("woof *plays with ball*");
    } else {
        console.error("Channel not found");
    }
});

client.on('messageCreate', (message) => {
    // Is the message from another bot? If so, ignore
    if (message.author.bot) {
        return;
    }
    const content = message.content.toLowerCase();

    // Respond to someone saying "hi"
    if (content.startsWith('hi') || content.endsWith('hi')) {
        const response = happyDogResponses[Math.floor(Math.random() * happyDogResponses.length)];
        message.channel.send(response);
    }

    // Respond to someone saying "ugly" or "stop"
    if (content.startsWith('ugly') || content.endsWith('stop')) {
        const response = madDogResponses[Math.floor(Math.random() * madDogResponses.length)];
        message.channel.send(response);
    }

    // Check if the message starts with "mocha "
    if (content.startsWith('mocha ')) {
        // Extract the command name by removing the prefix
        const command = message.content.slice(6); // "mocha " is 6 characters long

        // Execute the corresponding function based on the command
        switch (command) {
            case 'play':
                play(message);
                break;
            case 'stop':
                stop(message);
                break;
            default:
                message.reply('Unknown command!');
        }
    }
});

const playing = { is_playing: false, start_time: 0 };

client.login(process.env.TOKEN);
