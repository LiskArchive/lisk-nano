import moment from 'moment';
import { extractAddress } from '../api/account';

export const getForgedBlocks = (activePeer, limit = 10, offset = 0, generatorPublicKey) =>
  activePeer.blocks.get({
    limit,
    offset,
    generatorPublicKey,
  });

export const getForgedStats = (activePeer, startMoment, generatorPublicKey) =>
  activePeer.delegates.getForgingStatistics(
    extractAddress(generatorPublicKey),
    {
      start: moment(startMoment).unix(),
      end: moment().unix(),
    },
  );


// export const listDelegates = (activePeer, options) =>
// activePeer.delegates.get(options);
// getForgers
// getForgingStatistics
