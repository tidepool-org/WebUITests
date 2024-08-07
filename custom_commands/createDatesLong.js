module.exports = class createDatesLong {
  /**
   * command method of class checkSupressedNotification
   * @param {*} start
   * @param {*} end
   * @returns startDate, endDate, startDateFile, endDateFile
   */

  command(start, end) {
    return new Promise((resolve) => {
      const startDate = start.format('MMMM D, YYYY');
      const endDate = end.format('MMMM D, YYYY');
      const startDateFile = start.format('MM-DD-YYYY');
      const endDateFile = end.format('MM-DD-YYYY');
      const fileName = `RPM Report (${startDateFile} - ${endDateFile}).csv`;
      resolve({
        startDate, endDate, startDateFile, endDateFile, fileName,
      });
    });
  }
};
