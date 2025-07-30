// @ts-check
import { expect, test } from '@fixtures/base';

import PatientDataBasicsPage from '@pom/patient/BasicsPage';
import PatientDataDailyPage from '@pom/patient/DailyPage';

test.describe('Patient Data Navigation and Visualization', () => {
  test.beforeEach(async ({ page }) => {
    await test.step('Given user has been logged in', async () => {
      const basicsPage = new PatientDataBasicsPage(page);
      await basicsPage.goto();
      // await page.getByText("Loading").waitFor({ state: "detached", timeout: 10000 });
    });
  });

  // BG readings dashboard functionality
  test('should display daily chart when selecting a date from basics page', async ({ page }) => {
    const basicsPage = new PatientDataBasicsPage(page);
    const dailyPage = new PatientDataDailyPage(page);

    let selectedDateText: string | null;

    await test.step('When the navigation bar is visible', async () => {
      await basicsPage.navigationBar.buttons.viewData.waitFor({
        state: 'visible',
      });
    });

    await test.step('When the user clicks on the most recent day', async () => {
      const recentDayElement = basicsPage.bgReadingsSection.dayMostRecentBgReading;
      await recentDayElement.waitFor({ state: 'visible' });
      await recentDayElement.hover();

      selectedDateText = await basicsPage.bgReadingsSection.calendarDayhover.text();
      await basicsPage.bgReadingsSection.calendarDayhover.el.click();
    });

    await test.step('Then the daily chart is visible and correctly rendered', async () => {
      const chartContainer = dailyPage.dailyChart.container;
      await chartContainer.waitFor({ state: 'visible' });

      if (!selectedDateText) {
        throw new Error('Selected date text is null');
      }

      // Verify the selected date matches the displayed date
      await expect(dailyPage.navigationSubMenu.currentDate).toContainText(selectedDateText);

      // Capture chart screenshot for visual regression
      await expect(chartContainer).toHaveScreenshot('daily-chart-1.png');
    });
  });

  // Bolus dashboard functionality
  test('should display bolus dashboard when selecting a date from basics page', async ({
    page,
  }) => {
    const basicsPage = new PatientDataBasicsPage(page);
    const dailyPage = new PatientDataDailyPage(page);
    let selectedDateText: string | null;

    await test.step('When the navigation bar is visible', async () => {
      await basicsPage.navigationBar.buttons.viewData.waitFor({
        state: 'visible',
      });
    });

    await test.step('When the user clicks on the most recent day', async () => {
      const recentDayElement = basicsPage.bolusingSection.dayMostRecentBgReading;
      await recentDayElement.waitFor({ state: 'visible' });
      await recentDayElement.hover();

      selectedDateText = await basicsPage.bolusingSection.calendarDayhover.text();
      await basicsPage.bolusingSection.calendarDayhover.el.click();
    });

    await test.step('Then the daily chart is visible and correctly rendered', async () => {
      const chartContainer = dailyPage.dailyChart.container;
      await chartContainer.waitFor({ state: 'visible' });

      if (!selectedDateText) {
        throw new Error('Selected date text is null');
      }

      // Verify the selected date matches the displayed date
      await expect(dailyPage.navigationSubMenu.currentDate).toContainText(selectedDateText);

      // Capture chart screenshot for visual regression
      await expect(chartContainer).toHaveScreenshot('daily-chart-2.png');
    });
  });

  // Infusion Site Changes dashboard functionality
  test('should display Infusion site changes dashboard when selecting a date from basics page', async ({
    page,
  }) => {
    const basicsPage = new PatientDataBasicsPage(page);
    const dailyPage = new PatientDataDailyPage(page);
    let selectedDateText: string | null;

    await test.step('When the infusion site changes dashboard is visible', async () => {
      // Verify dashboard title and initial state
      // await expect(basicsPage.tubingPrimeSection.title).toBeVisible();
      // await expect(basicsPage.tubingPrimeSection.description).toHaveText(
      //   "We are using Fill Cannula to visualize your infusion site changes."
      // );
    });

    await test.step('When testing Fill Cannula functionality', async () => {
      // Verify radio button options
      await basicsPage.tubingPrimeSection.settingsOption.fillCannula.waitFor({
        state: 'visible',
        timeout: 60000,
      });

      await expect(basicsPage.tubingPrimeSection.settingsOption.fillCannula).toBeVisible();
      await expect(basicsPage.tubingPrimeSection.settingsOption.fillTubing).toBeVisible();

      // Select Fill Cannula and verify highlighted days
      await basicsPage.tubingPrimeSection.settingsOption.fillCannula.click();

      // // Verify duration indicator is visible
      // await expect(
      //   basicsPage.tubingPrimeSection.durationIndicator
      // ).toContainText("4 days");

      // Verify cannula icons are visible and tubing icons are not
      await expect(basicsPage.tubingPrimeSection.cannulaIcons).toBeAttached();
      await expect(basicsPage.tubingPrimeSection.tubingIcons).not.toBeAttached();

      // Select a highlighted day
      const highlightedDay = basicsPage.tubingPrimeSection.filledDay;
      await highlightedDay.hover();
      selectedDateText = await basicsPage.tubingPrimeSection.calendarDayhover.text();
      await basicsPage.tubingPrimeSection.calendarDayhover.el.click();
    });

    await test.step('Then the daily chart shows correct cannula fill date', async () => {
      const chartContainer = dailyPage.dailyChart.container;
      await chartContainer.waitFor({ state: 'visible' });
      if (!selectedDateText) {
        throw new Error('Selected date text is null');
      }
      await expect(dailyPage.navigationSubMenu.currentDate).toContainText(selectedDateText);
      await expect(chartContainer).toHaveScreenshot('daily-chart-cannula.png');
    });

    // Return to basics page and test Fill Tubing Option
    await test.step('When testing Fill Tubing functionality', async () => {
      // Navigate back to basics
      await test.step('When the navigation bar is visible', async () => {
        await basicsPage.navigationBar.buttons.viewData.waitFor({
          state: 'visible',
        });
      });
      await basicsPage.navigationSubMenu.links.basics.click();
      await basicsPage.tubingPrimeSection.settings.waitFor({
        state: 'visible',
      });

      // Click settings and select Fill Tubing
      await basicsPage.tubingPrimeSection.settings.click();
      await basicsPage.tubingPrimeSection.settingsOption.fillTubing.click();

      // Verify filled tubing day is visible and cannula day is not
      await expect(basicsPage.tubingPrimeSection.tubingIcons).toBeAttached();
      await expect(basicsPage.tubingPrimeSection.cannulaIcons).not.toBeAttached();

      // Click on the most recent day with tubing fill
      const tubingDay = basicsPage.tubingPrimeSection.filledDay;
      await tubingDay.hover();
      selectedDateText = await basicsPage.tubingPrimeSection.calendarDayhover.text();
      await basicsPage.tubingPrimeSection.calendarDayhover.el.click();
    });

    await test.step('Then the daily chart shows correct tubing fill date', async () => {
      const chartContainer = dailyPage.dailyChart.container;
      await chartContainer.waitFor({ state: 'visible' });
      if (!selectedDateText) {
        throw new Error('Selected date text is null');
      }
      await expect(dailyPage.navigationSubMenu.currentDate).toContainText(selectedDateText);
      await expect(chartContainer).toHaveScreenshot('daily-chart-tubing.png');
    });
  });
  // TODO: Previous test doesn't test values. Should we? :)
  // Readings in range functionality
  test('The hover over elements in sidebar shows correct values', async ({ page }) => {
    // Stats for BGM
    const expectedHeadersReadingInRange = [
      { header: 'Readings Below Range', value: 3 },
      { header: 'Readings Below Range', value: 0 },
      { header: 'Readings In Range', value: 71 },
      { header: 'Readings Above Range', value: 24 },
      { header: 'Readings Above Range', value: 2 },
    ];

    const basicsPage = new PatientDataBasicsPage(page);

    await test.step('When the navigation bar is visible', async () => {
      await basicsPage.navigationBar.buttons.viewData.waitFor({
        state: 'visible',
      });
    });

    // Other BGM tooltip functionality
    await basicsPage.statsSidebar.toggleTo('BGM');
    for (let i = 0; i < 5; i++) {
      const bar = basicsPage.statsSidebar.readingsInRange.hoverBar.nth(i);
      const barLabel = basicsPage.statsSidebar.readingsInRange.hoverBarLabel.nth(i);

      await test.step('When the user hovers over the Avg. Daily Readings In Range chart', async () => {
        await bar.hover();
      });

      await test.step('Then the correct header is visible', async () => {
        await expect
          .soft(basicsPage.statsSidebar.readingsInRange.header)
          .toContainText(expectedHeadersReadingInRange[i].header);
      });

      await test.step('Then the correct value is visible', async () => {
        await expect
          .soft(barLabel)
          .toContainText(expectedHeadersReadingInRange[i].value.toString());
      });
    }

    // Stats for CGM
    // Time in range functionality
    const expectedHeadersTimeInRange = [
      { header: 'Time Below Range', value: 0.1 },
      { header: 'Time Below Range', value: 1 },
      { header: 'Time In Range', value: 90 },
      { header: 'Time Above Range', value: 9 },
      { header: 'Time Above Range', value: 0.3 },
    ];
    await basicsPage.statsSidebar.toggleTo('CGM');
    for (let i = 0; i < expectedHeadersTimeInRange.length; i++) {
      const bar = basicsPage.statsSidebar.timeInRange.hoverBar.nth(i);
      const barLabel = basicsPage.statsSidebar.timeInRange.hoverBarLabel.nth(i);

      await test.step('When the user hovers over the Avg. Daily Time In Range chart', async () => {
        await bar.hover();
      });

      await test.step('Then the correct header is visible', async () => {
        await expect
          .soft(basicsPage.statsSidebar.timeInRange.header)
          .toContainText(expectedHeadersTimeInRange[i].header);
      });

      await test.step('Then the correct value is visible', async () => {
        await expect.soft(barLabel).toContainText(expectedHeadersTimeInRange[i].value.toString());
      });
    }
  });

  // Other CGM tooltip functionality
  test('other CGM tooltip functionality', async ({ page }) => {
    const basicsPage = new PatientDataBasicsPage(page);
    await basicsPage.statsSidebar.toggleTo('CGM');

    const expectedHeadersTimeInRange = [
      { header: 'Basal Insulin', value: 14.7, percentage: 44 },
      { header: 'Bolus Insulin', value: 18.8, percentage: 56 },
    ];

    for (let i = 0; i < expectedHeadersTimeInRange.length; i++) {
      const bar = basicsPage.statsSidebar.totalInsulin.hoverBar.nth(i);
      const barLabel = basicsPage.statsSidebar.totalInsulin.hoverBarLabel.nth(i);

      await test.step('When the user hovers over the Avg. Daily Total Insulin chart', async () => {
        await bar.hover();
      });

      await test.step('Then the correct header is visible', async () => {
        await expect
          .soft(basicsPage.statsSidebar.timeInRange.header)
          .toContainText(expectedHeadersTimeInRange[i].header);
      });

      await test.step('Then the correct value is visible', async () => {
        await expect.soft(barLabel).toContainText(expectedHeadersTimeInRange[i].value.toString());
      });
    }
  });
});
