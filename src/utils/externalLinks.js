import history from '../history';
import routesReg from './routes';

export default {
  init: () => {
    const { ipc } = window;

    if (ipc) {
      ipc.on('openUrl', (action, url) => {
        const normalizedUrl = url.replace('lisk://', '/');
        const route = routesReg.find(item => item.regex.test(normalizedUrl));
        if (route !== undefined) {
          history.push(normalizedUrl);
        }
      });
    }
  },
};

