# DLGM-Warnbot

Join the [Discord](https://discord.gg/RxzaN3jGeb)

Warn-bot for DLGM.

## How to install.

1. Make sure you have Node.js installed.
2. Clone the repository and run `npm install` in the folder.
3. Type `node bot.js`
4. Type in your bot token.
5. You are done!

## Launch options

Wanna disable the console? Or have no colours? Well, we have launch options!
`npm start` will launch the option `logconsole` enabled. But I will first tell you what we have:

- `createdb` - Creates the Warn Database.
- `resetdb` - Drops the Warn Database.
- `convert` - Converts the `.JSON` warns to the Database.
- `noconsole` - Disables all console output.
- `debug` - Will output debug messages to the console.
- `nowrite` - Disables log file writting. _NOTE:_ `logconsole` will override this for it's writes.
- `logconsole` - Writes all console output into the log file.
- `showfilestart` - Shows the file start.
- `nocolour` - Disables colour in the console.

To enable one of these just have it in the args when starting the bot. So:
`node bot.js [launch options]`
These have to be seperated by spaces. So if we would want to disable colour and have all debug output put into the console we would do:
`node bot.js nocolour debug`


# Networking: Bot responses

## General

```json
{
	"type": "error",
	"message": "invalidData"
}
```
This gets send when invalid data is send to the server.

```json
{
	"id": "123",
	"type": "error",
	"message": "generalError"
}
```
This gets sent when an error occures with the reqeust.
```json
{
	"id": "123",
	"type": "error",
	"message": "typeUnknown"
}
```
This gets sent when the data type is unknown. 

## AchievementCheck
```json
{
	"id":"123",
	"type": "achievement",
	"name": "yes?",
	"achievementId": 0,
	"description": "yes"
}
```
This gets sent as a response to a AchievementCheck. When none is found achievementId will be -1
## GiveAchievement
```json
{
	"id": "123",
	"type": "giveAchievementResponse",
	"wasGiven": true,
	"acId": 0
}
```
## Link

```json
{
	"id": "123",
	"type": "error",
	"message": "codeNotNew"
}
```
This happens when a code gets send for linking which is already in use.

```json
{
	"id": "123",
	"type": "error",
	"message": "noCode"
}
```
This gets sent when no code is given.
```json
{
	"id": "123",
	"type": "linkSuccess",
	"expiresIn": "seconds",
	"code": "code"
}
```
This gets sent when a link was registered. 

```json
{
	"id": "123",
	"type": "linkCheckResponse",
	"isFound": true/false
}
```
Response for if a link is in progress.

## updateStat
```json
{
	"id": "123",
	"type": "error",
	"message": "statNotFound"
}
```
This gets sent when the stat is not found or if the user doesn't have stats.
```json
{
	"id": "123",
	"type": "statUpdate",
	"updated": true
}
```
This gets sent when a stat was updated.

## resetStats
```json
{
	"id": "123",
	"type": "resetStatsResponse",
	"didReset": true
}
```
If a stat reset worked.

# Networking: What you can send to the bot

```json
{
	"id": "123",
	"type": "link",
	"data": {
		"code": "abc123"
	}
}
```
This starts the linking process.

```json
{
	"id": "123",
	"type": "linkCheck",
	"data": {}
}
```
Check if there is linking active for an ID.


```json
{
	"id": "123",
	"type": "achievementCheck",
	"data": {	
		"id": 0
	}
}
```
Gives you info for an achievement.

```json
{
	"id": "123",
	"type": "giveAchievement",
	"data": {
		"achievementId": 0
	}
}
```
Gives an ID a achievement

```json
{
	"id": "123",
	"type": "updateStat",
	"data": {
		"name": "statname",
		"value": "++1"
	}
}
```
Adds to a user stat. ++Value means it should add NOT set it.
```json
{
	"id": "123",
	"type": "resetStats",
	"data": {}
}
```
Reset all stats for an ID.
