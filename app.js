const { WebClient } = require('@slack/web-api');
const slackToken = process.env.SLACK_TOKEN;
const slackClient = new WebClient(slackToken); // posts messages

const { App } = require('@slack/bolt');

let users = [];
let activeUser;
let channel;
let channelName;
let header;
let button_action_id;
let button_text;

const app = new App({
  token: process.env.SLACK_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

(async () => {
  // Start the service
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();

app.error((error) => {
  console.error(error);
});

/**
 * The slash command to start the bot. Header and button text are dynamic.
 */
app.command('/scrum', async ({ body, ack, say }) => {
  console.log(body);
  channel = body.channel_id;
  channelName = body.channel_name;
  header = 'Welcome!';
  button_action_id = 'randomize';
  button_text = 'Random';

  await ack();

  // creates an array with all userObjects
  users = await buildUserObjects();

  // creates the participant buttons
  const participantOptions = await buildParticipantList(users);

  await say({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: header
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: button_text,
            emoji: true
          },
          value: 'whatever',
          action_id: button_action_id
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'actions',
        elements: participantOptions
      }
    ],
    text: 'Sorry something went wrong... super helpful right?'
  });
});

/**
 * Captures any button click from buttons with an action id that ends with _click
 */
app.action(/.*_click/, async ({ action, ack, respond }) => {
  await ack();

  activeUser = action.value;
  await updateUserObject(action.value);
  const participantOptions = await buildParticipantList(users);

  const activeUsers = users.filter((user) => {
    if (user.style == undefined) {
      return user;
    }
  });

  button_action_id = 'randomize';

  if (activeUsers.length) {
    header = action.value;
    button_text = 'Random';
  } else {
    button_action_id = 'close';
    button_text = 'Close';
    header = finalHeader();
  }

  await respond({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: header
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: button_text,
            emoji: true
          },
          value: 'click_me_123',
          action_id: button_action_id
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'actions',
        elements: participantOptions
      }
    ],
    text: 'Sorry something went wrong... super helpful right?'
  });
});

/**
 * Handles the random button.
 */
app.action('randomize', async ({ ack, respond }) => {
  await ack();

  const participantOptions = await getRandomUser();

  await respond({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: activeUser
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: button_text,
            emoji: true
          },
          value: 'click_me_123',
          action_id: button_action_id
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'actions',
        elements: participantOptions
      }
    ],
    text: 'Sorry something went wrong... super helpful right?'
  });
});

/**
 * Captures clicks from the close button (previously known as random), then deletes the original message.
 */
app.action('close', async ({ ack, respond }) => {
  await ack();

  await respond({
    delete_original: 'true'
  });
});

/**
 * Updates the style for the user object / button being clicked.
 * 1st click sets it to green, second click red, and third makes it go back to default / undefined
 * @param String name
 */
async function updateUserObject(name) {
  users.filter((user) => {
    if (user.name == name) {
      if (user.name == name) {
        if (user.style == undefined) {
          user.style = 'primary';
        } else if (user.style == 'primary') {
          user.style = 'danger';
        } else if (user.style == 'danger') {
          user.style = undefined;
        }
      }
    }
  });
}

/**
 * Creates the json for the participant buttons
 * @param [] list of user objects
 * @returns the json for the participant buttons
 */
async function buildParticipantList(users) {
  let buttons = [];

  users.forEach((obj) => {
    buttons.push({
      type: 'button',
      text: {
        type: 'plain_text',
        text: obj.name
      },
      style: obj.style,
      value: obj.name,
      action_id: `${obj.name}_click`
    });
  });

  return buttons;
}

/**
 * Creates the user objects by grabbing all users in the channel.
 * @returns [] of user objects
 */
async function buildUserObjects() {
  const userDisplayNames = await getAllUsers(channel);

  return userDisplayNames.map((displayName) => {
    // filter out anyone without a display name
    if (displayName != '') {
      return {
        name: displayName,
        style: undefined
      };
    }
  });
}

/**
 * Helper function that collects all users in the channel and filters out all bots.
 * @param String channel id;
 * @returns [] firstNames
 */
async function getAllUsers(channel) {
  const result = await slackClient.conversations.members({ channel: channel });
  // get all the memberIds but filter out any one that doesn't have a displayName, i.e. bots.
  let displayNames = [];
  for (let index = 0; index < result.members.length; index++) {
    const info = await slackClient.users.info({ user: result.members[index] });
    if (!info.user.is_bot) {
      displayNames.push(info.user.profile.first_name);
    }
  }
  return displayNames;
}

/**
 * Helper function for selecting a random user.
 * Sets the correct style for the random user. Also handles end of scrum logic by replacing the header with
 * a predefined team slogan, or default message.
 * @returns [] of buttons
 */
async function getRandomUser() {
  const activeUsers = users.filter((user) => {
    if (user.style == undefined) {
      return user;
    }
  });

  if (activeUsers.length) {
    const randUser = activeUsers[Math.floor(Math.random() * activeUsers.length)];

    randUser.style = 'primary';

    activeUser = randUser.name;

    users = users.map((user) => {
      if (user.name == randUser.name) {
        return randUser;
      } else {
        return user;
      }
    });

    const buttons = buildParticipantList(users);
    return buttons;
  } else {
    // we are done - is there a team slogan
    if (channelName == 'scrum') {
      button_action_id = 'close';
      button_text = 'Close';
      activeUser = finalHeader();
    }
    const buttons = buildParticipantList(users);
    return buttons;
  }
}

/**
 * Helper function that determines the correct team slogan based on channel name
 * @returns
 */
function finalHeader() {
  if (channelName == 'c0ff33') {
    return '*Boom Roasted!*';
  } else {
    return 'We are done! Break! :clap:';
  }
}
