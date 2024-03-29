module.exports = {
  url: function useEnvironmentUrl() {
    return this.api.launch_url;
  },
  elements: {
    navBar: '.App-navbar',
    patientsSection: '.patients',
    patientCard: '.patientcard',
    patientView: 'a[href$="data"]',
    patientShare: 'a[href$="share"]',
    patientUpload: 'a[title="Upload data"]',
  },
  commands: [{}],
};
