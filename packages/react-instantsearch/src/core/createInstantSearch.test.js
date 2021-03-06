import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { version } from '../../package.json';
import createInstantSearch from './createInstantSearch';
import InstantSearch from './InstantSearch.js';

Enzyme.configure({ adapter: new Adapter() });

describe('createInstantSearch', () => {
  const algoliaClient = { addAlgoliaAgent: jest.fn() };
  const algoliaClientFactory = jest.fn(() => algoliaClient);
  const CustomInstantSearch = createInstantSearch(algoliaClientFactory, {
    Root: 'div',
  });

  beforeEach(() => {
    algoliaClient.addAlgoliaAgent.mockClear();
    algoliaClientFactory.mockClear();
  });

  it('wraps InstantSearch', () => {
    const wrapper = shallow(
      <CustomInstantSearch appId="app" apiKey="key" indexName="name" />
    );

    // eslint-disable-next-line no-shadow
    const { algoliaClient, ...propsWithoutClient } = wrapper.props();

    expect(wrapper.is(InstantSearch)).toBe(true);
    expect(propsWithoutClient).toMatchSnapshot();
    expect(wrapper.props().algoliaClient).toBe(algoliaClient);
  });

  it('creates an algolia client using the provided factory', () => {
    shallow(<CustomInstantSearch appId="app" apiKey="key" indexName="name" />);

    expect(algoliaClientFactory).toHaveBeenCalledTimes(1);
    expect(algoliaClientFactory).toHaveBeenCalledWith('app', 'key');
    expect(algoliaClient.addAlgoliaAgent).toHaveBeenCalledTimes(1);
    expect(algoliaClient.addAlgoliaAgent).toHaveBeenCalledWith(
      `react-instantsearch ${version}`
    );
  });

  it('updates the algoliaClient when appId or apiKey changes', () => {
    const wrapper = shallow(
      <CustomInstantSearch appId="app" apiKey="key" indexName="name" />
    );

    wrapper.setProps({ appId: 'app2', apiKey: 'key' });
    wrapper.setProps({ appId: 'app', apiKey: 'key2' });

    expect(algoliaClientFactory).toHaveBeenCalledTimes(3);
    expect(algoliaClientFactory.mock.calls[1]).toEqual(['app2', 'key']);
    expect(algoliaClientFactory.mock.calls[2]).toEqual(['app', 'key2']);
  });

  it('uses the provided algoliaClient', () => {
    const wrapper = shallow(
      <CustomInstantSearch algoliaClient={algoliaClient} indexName="name" />
    );

    expect(algoliaClientFactory).toHaveBeenCalledTimes(0);
    expect(algoliaClient.addAlgoliaAgent).toHaveBeenCalledTimes(1);
    expect(wrapper.props().algoliaClient).toBe(algoliaClient);
  });

  it('updates the algoliaClient when provided algoliaClient is passed down', () => {
    const newAlgoliaClient = {
      addAlgoliaAgent: jest.fn(),
    };

    const wrapper = shallow(
      <CustomInstantSearch algoliaClient={algoliaClient} indexName="name" />
    );

    expect(algoliaClient.addAlgoliaAgent).toHaveBeenCalledTimes(1);

    wrapper.setProps({
      algoliaClient: newAlgoliaClient,
    });

    expect(wrapper.props().algoliaClient).toBe(newAlgoliaClient);
    expect(newAlgoliaClient.addAlgoliaAgent).toHaveBeenCalledTimes(1);
  });

  it('expect to create InstantSearch with a custom root props', () => {
    const root = {
      Root: 'span',
      props: {
        style: {
          flex: 1,
        },
      },
    };

    const wrapper = shallow(
      <CustomInstantSearch indexName="name" root={root} />
    );

    // eslint-disable-next-line no-shadow, no-unused-vars
    const { algoliaClient, ...propsWithoutClient } = wrapper.props();

    expect(wrapper.props().root).toEqual(root);
    expect(propsWithoutClient).toMatchSnapshot();
  });
});
