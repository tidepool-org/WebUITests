module.exports = class createDatesShort {
  /**
   * command method of class checkSupressedNotification
   * @param {*} start
   * @param {*} end
   * @returns startDate, endDate, startDateFile, endDateFile
   */

  command(start, end) {
    return new Promise((resolve) => {
      const startDate = start.format('MMM D, YYYY');
      const endDate = end.format('MMM D, YYYY');
      const startDateFile = start.format('MM-DD-YYYY');
      const endDateFile = end.format('MM-DD-YYYY');
      const fileName = `RPM Report (${startDateFile} - ${endDateFile}).csv`;
      resolve({
        startDate, endDate, startDateFile, endDateFile, fileName,
      });
    });
  }
};