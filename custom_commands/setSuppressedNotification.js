/* eslint-disable class-methods-use-this */
/* eslint-disable linebreak-style */
const axios = require('axios');

module.exports = class setSuppressedNotifcation {
  /**
   *  command method of class setSupressedNotification
   * @param {*} clinicianUsername
   * @param {*} clinicianPassword
   * @param {*} environment
   * @returns {number} http status code
   */
  command(clinicId, clinicianUsername, clinicianPassword, environment) {
    return new Promise((resolve) => {
      const auth = btoa(`${clinicianUsername}:${clinicianPassword}`);
      /**
     *
     * @returns {string} session token
     */
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
      /**
       * sets suppressed notification to True status
       * @returns {number} http status code
       */

      const setNotification = async () => {
        const token = await getToken();
        const response = await axios.post(
          `${environment}/v1/clinics/${clinicId}/suppressed_notifications`,

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
      /**
       * function calls asynchronous function setNotification and awaits for result
       * @returns result http status in resolved promise
       */
      const setNotificationRun = async () => {
        const data = await setNotification();
        resolve(data);
        // console.log("status: " + data)
      };
      setNotificationRun();
    });
  }
};
