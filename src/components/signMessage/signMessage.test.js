import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import sinon from 'sinon';
import PropTypes from 'prop-types';
import i18n from '../../i18n';
import SignMessage from './signMessage';


describe('SignMessage', () => {
  let wrapper;
  let successToastSpy;
  let copyMock;
  let props;
  let store;
  let options;
  const publicKey = 'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f';
  const signature1 = 'c68adc13131696c35ac82b9bb6884ee4de66ff281b013fe4ded66a73243c860b6a74b759bfb8d25db507ea2bec4bb208f8bb514fa18380416e637db947f0ab06';
  const signature2 = '29f6be7bac1ac7bc46f6285505ba042ee95bd7ffa473fa4296e18ace905d33c543d6609648fd56a8bd3acfbe90f3bdc2926056d6755a43b2da6bec09cf49d90f';
  const message1 = 'Hello world';
  const message2 = 'Hello 2 worlds';
  const account = {
    passphrase: 'wagon stock borrow episode laundry kitten salute link globe zero feed marble',
    publicKey,
  };
  const getResult = (message, signature) => (`-----BEGIN LISK SIGNED MESSAGE-----
-----MESSAGE-----
${message}
-----PUBLIC KEY-----
${publicKey}
-----SIGNATURE-----
${signature}
-----END LISK SIGNED MESSAGE-----`);

  beforeEach(() => {
    successToastSpy = sinon.spy();
    copyMock = sinon.mock();
    props = {
      account,
      successToast: successToastSpy,
      copyToClipboard: copyMock,
      t: key => key,
    };
    store = configureMockStore([])({
      account,
    });
    options = {
      context: { store, i18n },
      childContextTypes: {
        store: PropTypes.object.isRequired,
        i18n: PropTypes.object.isRequired,
      },
    };

    wrapper = mount(<SignMessage {...props} />, options);
  });

  it('allows to sign a message, copies sign message result to clipboard and shows success toast', () => {
    copyMock.returns(true);
    wrapper.find('.message textarea').simulate('change', { target: { value: message1 } });
    wrapper.find('#signMessageForm').simulate('submit');
    expect(wrapper.find('.result Input')).to.have.text(getResult(message1, signature1));
    expect(successToastSpy).to.have.been.calledWith({ label: 'Result copied to clipboard' });
  });

  it('allows to sign multiple messages, shows the signed message and success toast each time', () => {
    copyMock.returns(true);
    wrapper.find('.message textarea').simulate('change', { target: { value: message1 } });
    wrapper.find('#signMessageForm').simulate('submit');
    expect(wrapper.find('.result Input')).to.have.text(getResult(message1, signature1));
    expect(successToastSpy).to.have.been.calledWith({ label: 'Result copied to clipboard' });

    copyMock.reset();
    copyMock.returns(true);
    wrapper.find('.message textarea').simulate('change', { target: { value: message2 } });
    wrapper.find('#signMessageForm').simulate('submit');
    expect(wrapper.find('.result Input')).to.have.text(getResult(message2, signature2));
    expect(successToastSpy).to.have.been.calledWith({ label: 'Result copied to clipboard' });
  });

  it('allows to sign a message with a locked account', () => {
    copyMock.returns(true);

    store = configureMockStore([])({
      account: {
        ...account,
        passphrase: undefined,
      },
    });

    wrapper = mount(<SignMessage {...props} />, {
      ...options,
      context: { store, i18n },
    });

    wrapper.setProps({
      ...props,
      account: {
        ...account,
        passphrase: undefined,
      },
    });

    wrapper.find('.message textarea').simulate('change', { target: { value: message1 } });
    wrapper.find('.passphrase input').simulate('change', { target: { value: account.passphrase } });
    wrapper.find('#signMessageForm').simulate('submit');
    expect(wrapper.find('.result Input')).to.have.text(getResult(message1, signature1));
  });

  it('does not show success toast if copy-to-clipboard failed', () => {
    copyMock.returns(false);
    wrapper.find('.message textarea').simulate('change', { target: { value: message1 } });
    wrapper.find('#signMessageForm').simulate('submit');
    expect(successToastSpy).to.have.not.been.calledWith();
  });
});
