/* File that contains the formatting of the json object that any interactive message requires */

/* JSON object for interactive message with Confirm and Cancel buttons */
const responseJSON = {
    // "text": "*optional add text here*",
    "attachments": [
        {
            // "text": "Click to *Confirm* or *Cancel*!",
            "fallback": "[insert confirm and cancel buttons]",
            "callback_id": "something",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "confirm",
                    "text": "Confirm",
                    "type": "button",
                    "value": "true"
                },
                {
                    "name": "confirm",
                    "text": "Cancel",
                    "type": "button",
                    "value": "false"
                }
            ]
        }
    ]
};

/* function that returns JSON object for interactive message
    has dropdown with dates from dates array */

const getDropdownJson = (dates) => {
    dates.map((date) => {
        return {"text": date, "value": date}
    })
    const responseJSONConflict = {
        // "text": "*optional add text here*",
        "attachments": [
            {
                "text": "Choose a date that you are free",
                "fallback": "pick a date",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "callback_id": "date",
                "actions": [
                    {
                        "name": "date_list",
                        "text": "Pick a date...",
                        "type": "select",
                        "options": dates
                    }
                ]
            }
        ]
    };
}

module.exports = { responseJSON, getDropdownJson };