const { RtmClient, WebClient, CLIENT_EVENTS, RTM_EVENTS } = require('@slack/client');
const slackConfig = require('../config/slack');
const bot_token = slackConfig.SLACK_BOT_TOKEN || '';
const slack_verification = slackConfig.PRADY_TOKEN || '';
const axios = require('axios');
const slackService = require('./slackService');

const rtm = new RtmClient(bot_token);
var web = new WebClient(bot_token);


let channel;

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload if you want to cache it
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
    for (const c of rtmStartData.channels) {
        if (c.is_member && c.name ==='general') {
            channel = c.id; }
    }
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
    rtm.sendMessage('I am Iron Man', channel);
    console.log('JARVIS started!');
});

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {

    const dm = rtm.dataStore.getDMByUserId(message.user);
    if (!dm || dm.id !== message.channel || message.type !== 'message') {
        console.log('MESSAGE NOT SENT TO DM');
        return;
    }

    // if (message.text === 'amanda') {
    //     const msg = '<'+AUTH_PREFIX+'/connect?auth_id='+message.user+'>';
    //     return { send: msg };
    // }

    else if (message.text) {
        console.log('message: ',message);

        //process message has slack user ids
        if (message.text.indexOf('<@') >= 0) {
            let userIds = message.text.match(/<@\w+>/g);
            console.log('*************** userIds:', userIds,'***************');
            userIds.forEach(id => {
                message.text = message.text.replace(id, rtm.dataStore.getUserById(id.substring(2,id.length-1)).profile.real_name)+', ';
            });
            
            // message.text = 'REPLACED USER IDS TO BE: '+userIds.join(', ');
        }
        //INSERT PENDING PART :: DON'T SEND QUERY IF PENDING
        console.log('message: ',message);
        
        // slackService.getApiResponse(message, rtm, web)
        slackService.processMessage(message)
        .then((logic) => {
            if (logic.post) {
                // const {channel, msg, json} = slackService.getApiResponse(/*Params*/);
                web.chat.postMessage(message.channel, logic.post.msg, logic.post.json, function(err, res) {
                    if (err) {
                        console.log('Error:', err);
                    } else {
                        console.log('Message sent: ', res);
                        // needToRespond = false;
                    }
                });
            } else if (logic.send) {
                rtm.sendMessage(logic.send, message.channel);
            } else {
                console.log('reached unspecified');
            }
        })
        .catch((err) => {
            console.log('error: ', err);
        });
    }
    // }
});

module.exports = { web, rtm };


//NOTES: 

/* format of message response from slack: 

message:  { type: 'message',
  channel: 'D6A07ERGU',
  user: 'U6A0186VA',
  text: 'hiiiii',
  ts: '1500326827.965038',
  source_team: 'T6A275ZHT',
  team: 'T6A275ZHT' }

*/

/* slack text formatting:

bold:  asterisks  (surround)
code: three ticks  (surround)
strikethrough: tildes  (surround)
block quote 1p: left carrot  (on left)
block quote 2+p: 3 left carrots  (on left)

list: new line per item, and a number or bullet before each item  (on left)
*/


/* date formatting 
    
const date = Math.round(new Date('2017-07-21 20:00:00') / 1000);
^^date that slack can comprehend

*/

/* slack attachment eg:  (with button w/i aciton)

"attachments": [
        {
            "fallback": "Required plain-text summary of the attachment.",
            "color": "#36a64f",
            "pretext": "Optional text that appears above the attachment block",
            "author_name": "Bobby Tables",
            "author_link": "http://flickr.com/bobby/",
            "author_icon": "http://flickr.com/icons/bobby.jpg",
            "title": "Slack API Documentation",
            "title_link": "https://api.slack.com/",
            "text": "Optional text that appears within the attachment",
            "fields": [
                {
                    "title": "Priority",
                    "value": "High",
                    "short": false
                }
            ],
            "actions": [
                {
                    "name": "game",
                    "text": "Chess",
                    "type": "button",
                    "value": "chess"
                },
            "image_url": "http://my-website.com/path/to/image.jpg",
            "thumb_url": "http://example.com/path/to/thumb.png",
            "footer": "Slack API",
            "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
            "ts": 123456789
        }
    ]
*/



// cut code: 
// rtm.sendMessage(responseJSON, message.channel);  
            
            // app.post('/slack/slash-commands/send-me-buttons', urlencodedParser, (req, res) =>{
            //     res.status(200).end() // best practice to respond with empty 200 status code
            //     var reqBody = req.body
            //     var responseURL = reqBody.response_url
            //     if (reqBody.token != YOUR_APP_VERIFICATION_TOKEN){
            //         res.status(403).end("Access forbidden")
            //     }else{
            //         var message = {
            //             "text": "This is your first interactive message",
            //             "attachments": [
            //                 {
            //                     "text": "Building buttons is easy right?",
            //                     "fallback": "Shame... buttons aren't supported in this land",
            //                     "callback_id": "button_tutorial",
            //                     "color": "#3AA3E3",
            //                     "attachment_type": "default",
            //                     "actions": [
            //                         {
            //                             "name": "yes",
            //                             "text": "yes",
            //                             "type": "button",
            //                             "value": "yes"
            //                         },
            //                         {
            //                             "name": "no",
            //                             "text": "no",
            //                             "type": "button",
            //                             "value": "no"
            //                         },
            //                         {
            //                             "name": "maybe",
            //                             "text": "maybe",
            //                             "type": "button",
            //                             "value": "maybe",
            //                             "style": "danger"
            //                         }
            //                     ]
            //                 }
            //             ]
            //         }
            //         sendMessageToSlackResponseURL(responseURL, message);
            //     }
            // });

            // app.post('/slack/actions', urlencodedParser, (req, res) =>{
            //     res.status(200).end() // best practice to respond with 200 status
            //     var actionJSONPayload = JSON.parse(req.body.payload) // parse URL-encoded payload JSON string
            //     var message = {
            //         "text": actionJSONPayload.user.name+" clicked: "+actionJSONPayload.actions[0].name,
            //         "replace_original": false
            //     }
            //     sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
            // });

            

            // web.chat.postMessage(message.channel, 'Hello there', responseJSON, function(err, res) {
            //     if (err) {
            //         console.log('Error:', err);
            //     } else {
            //         console.log('Message sent: ', res);
            //     }
            // });


            // const channel = "#general"; //could also be a channel, group, DM, or user ID (C1234), or a username (@don)
        
        // if (parseInt(new Date(message.text))) {
            
        //     rtm.sendMessage("<@" + message.user + "> you sent a message with this date! \n "+formatted_date, message.channel); 
        //     // rtm.sendMessage(formatted_date, message.channel);   
        // } else if (message.text === "button") {
            // const date = Math.round(new Date(message.text) / 1000);
            // const formatted_date = "<!date^"+date+"^Date is:  {date_short} at {time}|Posted 2000-01-01 1:11:11 AM>";

            // cloudFuncs.helloHttp()
            // rtm.sendMessage("responding with button: ", message.channel);
        // }
            
        // } else {
            // rtm.sendMessage("<@" + message.user + "> you sent this message: *"+message.text+"*", message.channel);

             // rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
    //     if (message.user === 'U69S5RTGT') {

    //         var channel = "#general"; //could also be a channel, group, DM, or user ID (C1234), or a username (@don)
    //         rtm.sendMessage("Shut the fuck up <@" + message.user + ">!", message.channel);
    //     }
    // });


    

    // rtm.start();
// }

// function sendMessageToSlackResponseURL(responseURL, JSONmessage){
//     var postOptions = {
//         uri: responseURL,
//         method: 'POST',
//         headers: {
//             'Content-type': 'application/json'
//         },
//         json: JSONmessage
//     }
//     request(postOptions, (error, response, body) => {
//         if (error){
//             // handle errors as you see fit
//         }
//     })
// }
