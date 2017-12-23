import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import PropTypes from 'prop-types';

import i18n from '../../i18n';
import NoticeBoxHOC from './index';
import NoticeBox from './noticeBox';

describe('NoticeBoxHOC', () => {
  const store = configureMockStore([])({
    account: {},
  });
  const options = {
    context: { i18n, store },
    childContextTypes: {
      i18n: PropTypes.object.isRequired,
      store: PropTypes.object.isRequired,
    },
  };

  it('should render NoticeBox component', () => {
    const wrapper = mount(<NoticeBoxHOC />, options);
    expect(wrapper.find(NoticeBox)).to.have.lengthOf(1);
  });
});
