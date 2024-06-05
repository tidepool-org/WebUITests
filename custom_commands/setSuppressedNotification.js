/* eslint-disable class-methods-use-this */
/* eslint-disable linebreak-style */
const axios = require('axios');

module.exports = class setSuppressedNotifcation {
  command(clinicianUsername, clinicianPassword, environment) {
    return new Promise((resolve) => {
      const auth = btoa(`${clinicianUsername}:${clinicianPassword}`);

      const getToken = async () => {
        const response = await axios.post(
          `${environment}/auth/login`,
          '',
          {
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );
        return response.headers['x-tidepool-session-token'];
      };

      const setNotification = async () => {
        const token = await getToken();
        const response = await axios.post(
          'https://qa2.development.tidepool.org/v1/clinics/62419f38f85189a39ac4b68d/suppressed_notifications',

          {
            suppressedNotifications: {
              patientClinicInvitation: true,
            },
          },
          {
            headers: {
              'X-Tidepool-Session-Token': token,
              'Content-Type': 'application/json',
            },
          },
        );
        return response.status;
      };
      const setNotificationRun = async () => {
        const data = await setNotification();
        resolve(data);
        // console.log("status: " + data)
      };
      setNotificationRun();
    });
  }
};
