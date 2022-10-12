module.exports = {
  url: function useEnvironmentUrl() {
    return this.api.launch_url;
  },
  sections: {
    dailyViewDay: {
      selector: '#app',
      elements: {
        bgChart: '#poolBG',
      },
      commands: [{
      }],
    },
  },
  commands: [{
  }],
};
