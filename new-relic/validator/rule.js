import Validator from './validator';

class Rule {
  constructor(value, rules = [], message) {
    this.value = value;
    this.rules = rules;
    this.message = message;
    this.validator = new Validator();
  }

  isValid(isValid = val => val, failedValidation = val => val) {
    const hasValidValues = this.validator.validate(this.value, this.rules, this.message);

    if (hasValidValues) {
      isValid();
    } else {
      failedValidation(hasValidValues, this.message);
    }

    return hasValidValues;
  }
}

export default Rule;
