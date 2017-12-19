import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import NoticeBox from './noticeBox';

describe('NoticeBoxHOC', () => {
  const account = {
    isUninitialized: true,
  };

  const props = {
    account,
    t: key => key,
  };

  it('should render "Initialize account" button if account.isUninitialized', () => {
    const wrapper = shallow(<NoticeBox {...props} />);
    expect(wrapper.find('.initialize-account-button')).to.have.lengthOf(1);
  });

  it('should render null if !account.isUninitialized', () => {
    account.isUninitialized = false;
    const wrapper = shallow(<NoticeBox {...props} />);
    expect(wrapper.html()).to.equal(null);
  });
});

