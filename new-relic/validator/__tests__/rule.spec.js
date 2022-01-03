import Rule from '../rule';
import Validator from '../validator';

describe('Rule', () => {
  it('should have a value, list of rules, an error message, and a validator', () => {
    const test = new Rule(123, [Validator.isNumber], 'should only be a number');
    expect(test.value).toBeTruthy();
    expect(test.rules.length).toBeGreaterThan(0);
    expect(test.message).toBeTruthy();
    expect(test.validator).toBeTruthy();
  });

  it('should know if it isValid', () => {
    const test = new Rule(123, [Validator.isNumber], 'should only be a number');
    expect(test.isValid()).toBe(true);
  });

  it('should know if it is not valid', () => {
    const test = new Rule(123, [Validator.isString], 'should only be a string');
    expect(test.isValid()).toBe(false);
  });
});
