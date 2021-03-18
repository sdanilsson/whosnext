# whosnext

Bolt Slack bot to facilitate status meetings

![image](https://user-images.githubusercontent.com/15017748/111555849-7d9f8980-8746-11eb-82c5-b5f7ae43e5c7.png)

(
## Setup 
(https://api.slack.com/apps/)

### OAuth Scopes
* app_mentions:read
* channels:history
* channels:read
* chat:write
* commands
* users:read

### Event Subscrptions: 
* https://.../slack/events
### Slash Command (/scrum): 
https://.../slack/events
### Interactivity: 
https://.../slack/events

### Environment Vars:
* export SLACK_TOKEN=xoxb-xxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx
* export SLACK_SIGNIN_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

## How to Use
start the bot: /scrum

The app gathers all users in the channel and presents them as buttons that can be clicked.
First click green, second click red, third click default.
* Default = Attendee has not reported
* Green = Attendee has reported
* Red = Attendee not present

The header shows which user was selected last.
The "Random" button can be used to pick a random user from the participant list.
After all buttons have been set to green or red the heading changes to a predefined text depending on channel name, and the "Random" button changes to "Close". "Close" will delete the original message.





