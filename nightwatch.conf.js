require('dotenv').config();

module.exports = {
	'src_folders': ['tests'],
	'page_objects_path': ['pageobjects'],

	'webdriver': {
		'start_process': false,
		'host': 'hub-cloud.browserstack.com',
		'port': 80
	},

	'common_capabilities': {
		'browserstack.user': process.env.BROWSERSTACK_USER,
		'browserstack.key': process.env.BROWSERSTACK_KEY,
		'name': 'Bstack-[Nightwatch] Parallel Test'
	},
      
	'test_settings' : {
		'qa2_chrome' : {
			'desiredCapabilities' : {
				'browserName' : 'chrome'
			}
		}
		/*
    When we're ready to use multi-browser testing we can uncomment these 
    - add names to the test script in both the nightwatch.conf.js and travis.yml

    'qa2_firefox': {
      'desiredCapabilities': {
        'browserName': 'firefox'
      }
    },
    'qa2_safari': {
      "desiredCapabilities": {
        'browserName': 'safari'
      }
    },
    'qa2_ie': {
      'desiredCapabilities': {
        'browserName': "internet explorer"
      }
    } */
	},
	'globals': {
		'dsaUsername': process.env.DSA_USERNAME,
		'dsaPassword': process.env.DSA_PASSWORD,
	}
};