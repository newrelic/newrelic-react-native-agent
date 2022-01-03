import Utils from '../nr-utils';
import { LOG } from '../nr-logger';

class Validator {
  static isString = 'isString';

  static isBool = 'isBool';

  static isNumber = 'isNumber';

  static isObject = 'isObject';

  static notEmptyString = 'notEmptyString';

  static hasValidAttributes = 'hasValidAttributes';

  validate = (value, rules, msg) => rules.every((rule) => {
    const isValid = Utils[rule](value);
    if (!isValid) {
      LOG.error(msg);
    }
    return Utils[rule](value);
  });
}

export default Validator;
