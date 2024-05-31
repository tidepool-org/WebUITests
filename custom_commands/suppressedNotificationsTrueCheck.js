const axios = require('axios');

module.exports = {
  command: async function (clinicianUsername, clinicianPassword, environment) {
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

    const clinicData = async () => {
      const token = await getToken();
      response = await axios.get('https://qa2.development.tidepool.org/v1/clinicians/4ae71760b6/clinics', {

        params: {
          limit: '1000',
          offset: '0',
        },
        headers: {
          authority: 'qa2.development.tidepool.org',
          accept: '*/*',
          'accept-language': 'en-US,en;q=0.9',
          cookie: '_ga=GA1.1.516068539.1692684735; _ga_RWXQ3R57PB=GS1.1.1694192507.4.0.1694192507.0.0.0',
          referer: 'https://qa2.development.tidepool.org/',
          'sec-ch-ua': '"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
          'x-tidepool-session-token': token,
          'x-tidepool-trace-session': '92df086f-917e-4df5-b32d-cb30d15df795',
        },
      });
      return response.data;
    };

    const clinicDataRun = async () => {
      let found = false;
      const data = await clinicData();
      for (let i = 0; i < data.length; i++) {
        if (data[i].clinic.id == '62419f38f85189a39ac4b68d') {
          if (data[i].clinic.suppressedNotifications.patientClinicInvitation == true) {
            this.assert.strictEqual(true, true, '/suppressed_notification status is true in clinic object ');
            found = true;
            break;
          }
        }
      }
      if (found == false) {
        this.assert.strictEqual(false, true, '/suppressed_notification status is true in clinic object ');
      }
    };
    clinicDataRun();
  },
};
