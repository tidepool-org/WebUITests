export default class DailyChartSection {
    constructor(page) {
        this.page = page;
        this.container = page.locator('div.patient-data-content');
        this.dayLabel = this.container.locator('text.d3-day-label').filter({ visible: true });
        this.newNote = this.container.locator('image.newNoteIcon');
        this.buttons = {
            refresh: this.container.getByRole('button', { name: 'Refresh' }),
        };
    }
}
