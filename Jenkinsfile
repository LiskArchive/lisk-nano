pipeline {
	agent { label 'master' }
	environment {
		ON_JENKINS = 'TRUE'
	}
	stages { 
	  stage ('Lisk Provisioning') { 
			steps {
			parallel(
				"Build Components for Nano" : {
					node('master'){
					sh '''#!/bin/bash
								cd /var/lib/jenkins/workspace/
								pkill -f app.js || true
								rm -rf lisk
								git clone https://github.com/LiskHQ/lisk.git
								cd lisk
								git checkout development
								dropdb lisk_test || true
								createdb lisk_test
								psql -d lisk_test -c "alter user "$USER" with password 'password';"
								cp /var/lib/jenkins/workspace/lisk-node-Linux-x86_64.tar.gz .
								tar -zxvf lisk-node-Linux-x86_64.tar.gz
								npm install
								git submodule init
								git submodule update
								cd public
								npm install
								bower install
								grunt release
								cd ..
								cd test/lisk-js/; npm install; cd ../..
								cp test/config.json test/genesisBlock.json .
								export NODE_ENV=test
								BUILD_ID=dontKillMe ~/start_lisk.sh
						 '''
					}
					node('master'){
					sh '''#!/bin/bash
								pkill -f selenium -9 || true
								pkill -f Xvfb -9 || true
								rm -rf /tmp/.X0-lock || true
								cd /var/lib/jenkins/workspace/
								rm -rf lisk-nano
								git clone https://github.com/LiskHQ/lisk-nano.git
								cd lisk-nano
								git checkout $BRANCH_NAME
								npm install
								cd src
								npm install
						 '''
					}
				})
			}
		}
		stage ('Run Tests') { 
			steps {
			parallel(
			  "e2e tests" : {
					node('master'){
					sh '''#!/bin/bash
							  export COVERALLS_REPO_TOKEN = $LISK_NANO_COVERALLS
								cd /var/lib/jenkins/workspace/lisk-nano/src
								npm run build
								npm run dev &> .lisk-nano.log &
								bash ~/tx.sh
								npm run test
								export CHROME_BIN=chromium-browser
								export DISPLAY=:0.0
								Xvfb :0 -ac -screen 0 1280x1024x24 &
								./node_modules/protractor/bin/webdriver-manager update
								./node_modules/protractor/bin/webdriver-manager start &
								npm run e2e-test
						 '''
					 }
				 })
			}
		}
		stage ('Output logging') {     
			steps {
			parallel(
			  "Output Logs from Testing" : {
				  node('master'){
				  sh '''#!/bin/bash
								cd /var/lib/jenkins/workspace/lisk-nano/src
								cat .protractor.log
								cat .lisk-core.log
								cat .lisk-nano.log
					   '''
					}
				})
			}
		}
		stage ('Node Cleanup') {     
			 steps {
			 parallel(
				 "Cleanup Lisk-Core for Nano" : {
				   node('master'){
					 sh '''#!/bin/bash
								 pkill -f app.js -9 
							'''
					 }
				 })
			}
		}
	}
}

