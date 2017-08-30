import React from 'react';
import { TableRow, TableCell } from 'react-toolbox/lib/table';
import Checkbox from './voteCheckbox';
import styles from './voting.css';

const setRowClass = ({ pending, selected, voted }) => {
  if (pending) {
    return styles.pendingRow;
  } else if (selected) {
    return voted ? styles.votedRow : styles.upVoteRow;
  }
  return voted ? styles.downVoteRow : '';
};

class VotingRow extends React.Component {
  // eslint-disable-next-line class-methods-use-this
  shouldComponentUpdate(nextProps) {
    return !!nextProps.data.dirty;
  }

  render() {
    const props = this.props;
    const { data, ...otherProps } = props;
    return (<TableRow {...otherProps} className={`${styles.row} ${setRowClass(data)}`}>
      <TableCell>
        <Checkbox styles={styles}
          value={data.selected}
          pending={data.pending}
          data={data}
        />
      </TableCell>
      <TableCell>{data.rank}</TableCell>
      <TableCell>{data.username}</TableCell>
      <TableCell>{data.address}</TableCell>
      <TableCell>{data.productivity} %</TableCell>
      <TableCell>{data.approval} %</TableCell>
    </TableRow>
    );
  }
}

export default VotingRow;
