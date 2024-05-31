const axios = require('axios');

module.exports = {
  command: async function () {
    


const getToken = async () => {
    const response = await axios.post(
        'https://qa2.development.tidepool.org/auth/login',
        '',
        {
            headers: {
                'Authorization': 'Basic YnJpYW4rdXBsb2FkNzg2d2ViMTMyN2NsaW5pYzM1YUB0aWRlcG9vbC5vcmc6dGlkZXBvb2w=',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
    return response.headers['x-tidepool-session-token']
}



const setNotification = async () => {
    const token = await getToken();
    response = await axios.post(
        'https://qa2.development.tidepool.org/v1/clinics/62419f38f85189a39ac4b68d/suppressed_notifications',
        // '{\n    "suppressedNotifications": {\n        "patientClinicInvitation": true\n    }\n}',
        {
            'suppressedNotifications': {
                'patientClinicInvitation': true
            }
        },
        {
            headers: {
                'X-Tidepool-Session-Token': token,
                'Content-Type': 'application/json'
            }
        }
    )
    return response.status
}
const setNotificationRun = async () => {
    const data = await setNotification()
    this.assert.strictEqual(data, 200, '/suppressed_notification set to true returned 200 ')
    //console.log("status: " + data)
}
setNotificationRun()
;
  }
};