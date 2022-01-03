class Log {
  constructor() {
    this.verbose = false;
    this.nameSpace = '[NRMA]';
  }

  info(text) {
    // eslint-disable-next-line no-console
    console.log(`${this.nameSpace} ${text}`);
  }

  // only shows up in verbose mode
  debug(text) {
    if (this.verbose) {
      // eslint-disable-next-line no-console
      console.log(`${this.nameSpace}:DEBUG ${text}`);
    }
  }

  error(text) {
    // eslint-disable-next-line no-console
    //console.log(`${this.nameSpace} ${text}`);
  }

  warn(text) {
    // eslint-disable-next-line no-console
    console.log(`${this.nameSpace} ${text}`);
  }
}

export const LOG = new Log();
export default Log;
