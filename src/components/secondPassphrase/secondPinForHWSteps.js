export default context => ({
  info: {
    cancelButton: {
      title: () => context.props.t('Cancel'),
      onClick: () => { context.props.closeDialog(); },
    },
    confirmButton: {
      title: () => context.props.t('Next'),
      fee: () => context.props.fee,
      onClick: () => { context.setState({ current: 'insert' }); },
    },
  },
  insert: {
    cancelButton: {
      title: () => context.props.t('Cancel'),
      onClick: () => { context.props.closeDialog(); },
    },
    confirmButton: {
      title: () => context.props.t('Next'),
      fee: () => {},
      onClick: () => { context.setState({ current: 'confirm' }); },
    },
  },
  confirm: {
    cancelButton: {
      title: () => context.props.t('Back'),
      onClick: () => { context.setState({ current: 'insert' }); },
    },
    confirmButton: {
      title: () => context.props.confirmButton,
      fee: () => context.props.fee,
      onClick: () => {
        context.props.onPinInsert(context.state.pin);
        if (!context.props.keepModal) {
          context.props.closeDialog();
        }
      },
    },
  },
});
