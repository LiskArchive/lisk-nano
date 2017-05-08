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
                      node('node-01'){
                       sh '''#!/bin/bash
                             cd /home/lisk/jenkins/workspace/
                             pkill -f app.js || true
                             rm -rf lisk
                             git clone https://github.com/LiskHQ/lisk.git
                             cd lisk
                             git checkout development
                             dropdb lisk_test || true
                             createdb lisk_test
                             psql -d lisk_test -c "alter user "$USER" with password 'password';"
                             cp ~/lisk-node-Linux-x86_64.tar.gz .
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
                             cd /home/lisk/jenkins/workspace/
                             rm -rf lisk-nano
                             git clone https://github.com/LiskHQ/lisk-nano.git
                             cd lisk-nano
                             git checkout $BRANCH_NAME
                             npm install
                             cd src
                             npm install
                          '''
                      }
                    }
                 )
             }
           }
           stage ('Parallel Tests') { 
               steps {
                 parallel(
                   "ESLint" : {
                     node('master'){
                      sh '''
                      cd /home/lisk/jenkins/workspace/lisk-nano/src
                      npm run dev &> .lisk-nano.log &
                      npm run test
                      ./node_modules/protractor/bin/webdriver-manager update
                      ./node_modules/protractor/bin/webdriver-manager start &
                      export CHROME_BIN=chromium-browser
                      export DISPLAY=:0.0
                      Xvfb :0 -ac -screen 0 1280x1024x24 &
                      npm run e2e-test
                      '''
                     }
                   }
               )
            }
         }
         stage ('Output logging') {     
           steps {
             parallel(
               "Output Logs from Testing : {
                 node('master'){
                   sh '''#!/bin/bash
                     cd /home/lisk/jenkins/workspace/lisk-nano/src
                     cat .protractor.log
                     cat .lisk-core.log
                     cat .lisk-nano.log
                      '''
                     }
                   }
            )
          }
        }
        stage ('Node Cleanup') {     
           steps {
             parallel(
               "Cleanup Lisk-Core for Nano" : {
                 node('master'){
                   sh '''
                     pkill -f app.js -9 
                      '''
                     }
                   }
               }
            )
          }
        }
    }
}

