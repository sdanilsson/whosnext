# whosnext

Bolt Slack bot to facilitate status meetings
All events are passed to /slack/events

## Setup
### OAuth Scopes
* app_mentions:read
* channels:history
* channels:read
* chat:write
* commands
* incoming-webhoob (not used at the moment)
* users:read

### Event Subscrptions: 
* https://.../slack/events
### Slash Command (/scrum): 
https://.../slack/events
### Interactivity: 
https://.../slack/events

## How to Use
start the bot: /scrum

The app gathers all users in the channel and presents them as buttons that can be clicked.
First click green, second click red, third click default.
* Default = User has not reported
* Green = User has reported
* Red = User not present

The header shows which user was selected last.
The "Random" button can be used to pick a random user from the participant list.
After all buttons have been set to green or red the heading changes to a predefined text depending on channel name, and the "Random" button changes to "Close". "Close" will delete the original message.





