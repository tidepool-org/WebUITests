module.exports = {
	'Should Login with Correct Credentials'(browser) {
		const loginPage = browser.page.loginPage();
		const dsaUsername = browser.globals.dsaUsername;
		const dsaPassword = browser.globals.dsaPassword;
  
		loginPage
			.navigate()
			.waitForElementVisible('@usernameInput', 'Login Page Loaded')
			.loginDsa(dsaUsername, dsaPassword)
			.assert.urlContains('data', 'Successful Navigation to Patient Data Page')
			.saveScreenshot('tests_output/login.png');
	},
};