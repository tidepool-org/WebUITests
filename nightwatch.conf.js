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
          },
          'qa2_firefox': {
            'desiredCapabilities': {
              'browserName': 'firefox'
            }
          },
          'dev_chrome': {
            "desiredCapabilities": {
              'browserName': 'safari'
            }
          },
          'int_chrome': {
            'desiredCapabilities': {
              'browserName': "internet explorer"
            }
          }
        },
        'globals': {
          'dsaUsername': process.env.DSA_USERNAME,
          'dsaPassword': process.env.DSA_PASSWORD,
        }
      }