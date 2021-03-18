const SlackBot = require('slackbots');

const bot = new SlackBot({
    token: 'xoxb-4685376977-1835637378147-TTHgE0FvI0jQS7Kys0fsmYfN',
    name: 'whosnext'
});

// start
bot.on('start', () => {
    bot.postMessageToChannel('Andreas','whosnext started');
})