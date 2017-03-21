
import crypto from 'crypto';
import mnemonic from 'bitcore-mnemonic';

import './login.less';
import './save.less';

app.component('login', {
  template: require('./login.pug')(),
  bindings: {
    passphrase: '=',
    onLogin: '&',
  },
  controller: class login {
    constructor($scope, $rootScope, $timeout, $document, $mdDialog, $mdMedia, $cookies) {
      this.$scope = $scope;
      this.$rootScope = $rootScope;
      this.$timeout = $timeout;
      this.$document = $document;
      this.$mdDialog = $mdDialog;
      this.$mdMedia = $mdMedia;
      this.$cookies = $cookies;

      this.$scope.$watch('$ctrl.input_passphrase', this.isValid.bind(this));
      this.$timeout(this.devTestAccount.bind(this), 200);

      this.$scope.$watch(() => this.$mdMedia('xs') || this.$mdMedia('sm'), (wantsFullScreen) => {
        this.$scope.customFullscreen = wantsFullScreen === true;
      });
    }

    reset() {
      this.input_passphrase = '';
      this.progress = 0;
      this.seed = login.emptyBytes().map(() => '00');
    }

    stop() {
      this.random = false;
      this.$document.unbind('mousemove', this.listener);
    }

    go() {
      this.passphrase = login.fix(this.input_passphrase);

      this.reset();
      this.$timeout(this.onLogin);
    }

    isValid(value) {
      const fixedValue = login.fix(value);

      if (fixedValue === '') {
        this.valid = 2;
      } else if (fixedValue.split(' ').length < 12 || !mnemonic.isValid(fixedValue)) {
        this.valid = 0;
      } else {
        this.valid = 1;
      }
    }

    start() {
      this.reset();

      this.random = true;

      let last = [0, 0];
      let used = login.emptyBytes();

      const turns = 10 + parseInt(Math.random() * 10, 10);
      const steps = 2;
      const total = turns * used.length;
      let count = 0;

      this.listener = (ev) => {
        const distance = Math.sqrt(Math.pow(ev.pageX - last[0], 2) +
          (Math.pow(ev.pageY - last[1]), 2));

        if (distance > 60 || ev.isTrigger) {
          for (let p = 0; p < steps; p++) {
            let pos;
            const available = used.map((u, i) => (!u ? i : null)).filter(u => u !== null);

            if (!available.length) {
              used = used.map(() => 0);
              pos = parseInt(Math.random() * used.length, 10);
            } else {
              pos = available[parseInt(Math.random() * available.length, 10)];
            }

            count++;

            if (!ev.isTrigger) {
              last = [ev.pageX, ev.pageY];
            }

            used[pos] = 1;

            const update = () => {
              this.seed[pos] = login.lpad(crypto.randomBytes(1)[0].toString(16), '0', 2);
              this.progress = parseInt((count / total) * 100, 10);
            };

            if (this.$scope.$root.$$phase !== '$apply' && this.$scope.$root.$$phase !== '$digest') {
              this.$scope.$apply(update);
            } else {
              update();
            }

            if (count >= total) {
              this.stop();
              this.setNew();
              return;
            }
          }
        }
      };

      this.$timeout(() => this.$document.mousemove(this.listener), 300);
    }

    asd() {
      this.$document.mousemove();
    }

    setNew() {
      const passphrase = (new mnemonic(new Buffer(this.seed.join(''), 'hex'))).toString();
      const ok = () => {
        this.input_passphrase = passphrase;
        this.$timeout(this.go.bind(this), 100);
      };

      this.$mdDialog.show({
        controllerAs: '$ctrl',
        controller: /* @ngInject*/ class save {
          constructor($scope, $mdDialog) {
            this.$mdDialog = $mdDialog;
            this.passphrase = passphrase;

            $scope.$watch('$ctrl.missing_input', () => {
              this.missing_ok = this.missing_input && this.missing_input === this.missing_word;
            });
          }

          next() {
            this.enter = true;

            const words = this.passphrase.split(' ');
            const missingNumber = parseInt(Math.random() * words.length, 10);

            this.missing_word = words[missingNumber];
            this.pre = words.slice(0, missingNumber).join(' ');
            this.pos = words.slice(missingNumber + 1).join(' ');
          }

          ok() {
            ok();
            this.close();
          }

          close() {
            this.$mdDialog.hide();
          }
        },

        template: require('./save.pug')(),
        fullscreen: (this.$mdMedia('sm') || this.$mdMedia('xs')) && this.$scope.customFullscreen,
      });
    }

    devTestAccount() {
      const passphrase = this.$cookies.get('passphrase');
      if (passphrase) {
        this.input_passphrase = passphrase;
        this.$timeout(this.go.bind(this), 10);
      }
    }

    static fix(v) {
      return (v || '').replace(/ +/g, ' ').trim().toLowerCase();
    }

    static lpad(str, pad, length) {
      let result = str;
      while (result.length < length) result = pad + str;
      return result;
    }

    static emptyBytes() {
      return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    static mobileAndTabletcheck() {
      let check = false
      ;(function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd(m|p|t)|hei|hi(pt|ta)|hp( i|ip)|hsc|ht(c(| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i(20|go|ma)|i230|iac( ||\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|[a-w])|libw|lynx|m1w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|mcr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|([1-8]|c))|phil|pire|pl(ay|uc)|pn2|po(ck|rt|se)|prox|psio|ptg|qaa|qc(07|12|21|32|60|[2-7]|i)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h|oo|p)|sdk\/|se(c(|0|1)|47|mc|nd|ri)|sgh|shar|sie(|m)|sk0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h|v|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl|tdg|tel(i|m)|tim|tmo|to(pl|sh)|ts(70|m|m3|m5)|tx9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas|your|zeto|zte/i.test(a.substr(0, 4))) check = true; }(navigator.userAgent || navigator.vendor || window.opera));
      return check;
    }
  },
});
