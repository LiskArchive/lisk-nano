import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';

import i18n from '../../i18n';
import VerifyMessage from './index';

describe('VerifyMessage', () => {
  let wrapper;
  const publicKey = 'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f';
  const signature = 'c68adc13131696c35ac82b9bb6884ee4de66ff281b013fe4ded66a73243c860b6a74b759bfb8d25db507ea2bec4bb208f8bb514fa18380416e637db947f0ab06';
  const message = 'Hello world';

  beforeEach(() => {
    wrapper = mount(<VerifyMessage i18n={i18n} />);
  });

  it('allows to verify a message', () => {
    wrapper.find('.message input').simulate('change', { target: { value: message } });
    wrapper.find('.public-key input').simulate('change', { target: { value: publicKey } });
    wrapper.find('.signature textarea').simulate('change', { target: { value: signature } });
    expect(wrapper.find('.result textarea').text()).to.equal('Message verified');
  });

  it('recognizes invalid public key', () => {
    wrapper.find('.message input').simulate('change', { target: { value: message } });
    wrapper.find('.public-key input').simulate('change', { target: { value: publicKey.substr(2) } });
    wrapper.find('.signature textarea').simulate('change', { target: { value: signature } });
    wrapper.update();
    expect(wrapper.find('Input.public-key').text()).to.contain('Invalid');
  });

  it('recognizes invalid signature', () => {
    wrapper.find('.message input').simulate('change', { target: { value: message } });
    wrapper.find('.public-key input').simulate('change', { target: { value: publicKey } });
    wrapper.find('.signature textarea').simulate('change', { target: { value: signature.substr(2) } });
    expect(wrapper.find('Input.signature').text()).to.contain('Invalid');
  });
});
