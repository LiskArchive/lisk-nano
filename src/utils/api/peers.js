import apiMethod from 'lisk-js/dist-node/api_client/api_method';
// import { loadingStarted, loadingFinished } from '../../utils/loading';
// eslint-disable-next-line import/prefer-default-export
export const requestToActivePeer = (activePeer, path, urlParams) =>
  apiMethod(path, urlParams).bind(activePeer);
// new Promise((resolve, reject) => {
//   loadingStarted(path);
//   .then (data) => {
//     if (data.data) {
//       resolve(data);
//     } else {
//       reject(data);
//     }
//     loadingFinished(path);
//   }).bind(activePeer);
// });

