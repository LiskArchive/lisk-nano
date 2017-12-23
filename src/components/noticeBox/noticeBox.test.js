import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import NoticeBox from './noticeBox';

describe('NoticeBoxHOC', () => {
  const account = {
    serverPublicKey: null,
    balance: 10e8,
  };

  const props = {
    account,
    t: key => key,
  };

  it('should render "Initialize account" button if !account.serverPublicKey and account.balace > 0', () => {
    const wrapper = shallow(<NoticeBox {...props} />);
    expect(wrapper.find('.initialize-account-button')).to.have.lengthOf(1);
  });

  it('should render null if account.serverPublicKey', () => {
    account.serverPublicKey = 'a valid publicKey';
    const wrapper = shallow(<NoticeBox {...props} />);
    expect(wrapper.html()).to.equal(null);
  });
});

