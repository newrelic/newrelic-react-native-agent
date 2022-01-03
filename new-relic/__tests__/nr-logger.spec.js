import { LOG } from '../nr-logger';

describe('nr log', () => {
  beforeEach(() => {
    LOG.verbose = false;
  });

  it('should have a namespace', () => {
    expect(LOG.nameSpace).toEqual('[NRMA]');
  });

  it('should have a verbose flag', () => {
    expect(LOG.verbose).toEqual(false);
  });

  it('should have info, debug, error, and warn methods', () => {
    expect(LOG.info).toBeTruthy();
    expect(LOG.debug).toBeTruthy();
    expect(LOG.error).toBeTruthy();
    expect(LOG.warn).toBeTruthy();
  });

  it('should only log debugs in verbose mode', () => {
    let outputData = '';
    const storeLog = (inputs) => {
      outputData += inputs;
      return outputData;
    };
    // eslint-disable-next-line no-console
    console.log = jest.fn(storeLog);

    LOG.debug('dont see me');
    expect(outputData).toBe('');

    LOG.verbose = true;
    LOG.debug('yassss');
    expect(outputData.indexOf('yassss') > -1).toBe(true);
    expect(outputData.indexOf('NRMA') > -1).toBe(true);
    expect(outputData.indexOf('DEBUG') > -1).toBe(true);
  });
});
