export default class Utils {
  static isObject(value) {
    return value instanceof Object && !(value instanceof Array);
  }

  static isString(value) {
    return typeof value === 'string' || value instanceof String;
  }

  static isBool(value) {
    return typeof value === 'boolean' || value instanceof Boolean;
  }

  static isNumber(value) {
    return !Number.isNaN(parseFloat(value)) && Number.isFinite(value);
  }

  static notEmptyString(value) {
    return value && value.length !== 0;
  }

  static hasValidAttributes(attributes) {
    return Utils.isObject(attributes) && attributes !== null;
  }
}
