// Local Import
const auth = require('./authentication');


/************************* Exported Methods *************************/

function checkFreeBusy(slackId, email, start, end) {
  return new Promise((resolve, reject) => {
    auth.getGoogleCalendar(slackId)
    .then(calendar => {
      calendar.freebusy.query({
        resource: {
          timeMin: start,
          timeMax: end,
          items: [{
            id: email
          }]
        }
      }, (err, resp) => {
        if (err) reject(err);
        const busy = resp.calendars[email].busy
        resolve({slackId, email, busy});
      } )
    }).catch(reject);
  });

}

// calendar.craeteReminder(slackId, date, subject)
//  - Param: slackId -> String
//           date    -> Date
//           subject -> String
//  - Description: Adds a Reminder event to the Google Calendars
//    for the user specified by the slackId for the date
//    specified with the subject specified
function createReminder(slackId, date, subject) {
  return new Promise((resolve, reject) => {
    auth.getGoogleCalendar(slackId)
    .then(calendar => {
      calendar.events.insert({
        calendarId: 'primary',
        resource: generateReminder(date, subject)
      }, (err, resp) => {
        if (err) reject(err);
        resolve(resp);
      })
    }).catch(reject);
  })
}

// calendar.createMeeting(slackId, start, end, subject, attendees)
//  - Param: slackId   -> String
//           start     -> Date
//           end       -> Date
//           subject   -> String
//           attendees -> Array of Emails
//  - Description: Adds a Meeting event to the Google Calendars
//    for the user aspecified by the slackId and the attendees specified
//    for the start and end dates (with times) specified
//    and with the subject specified
function createMeeting(slackId, start, end, subject, attendees) {
  return new Promise((response, reject) => {
    auth.getGoogleCalendar(slackId)
    .then(calendar => {
      calendar.events.insert({
        calendarId: 'primary',
        resource: generateMeeting(start, end, subject, attendees)
      }, function(err, resp) {
        if (err) reject(err);
        resolve(resp);
      })
    })
    .catch(reject);
  });
}


/************************* Local Methods *************************/

// Local Helper Function
// Generates a meeting event object
function generateReminder(date, subject) {
  return {
    'summary': subject,
    'start': {
      'date': date.toISOString().substring(0,10)
    },
    'end': {
      'date': date.toISOString().substring(0,10)
    }
  };
}

// Local Function
// Generates a meeting event object
function generateMeeting(start, end, subject, attendees) {
  return {
    'summary': subject,
    'start': {
      'dateTime': start.toISOString()
    },
    'end': {
      'dateTime': end.toISOString()
    },'attendees': attendees.map(email => ({'email': email}))
  };
}


module.exports = {
  createReminder,
  createMeeting,
  checkFreeBusy
}
