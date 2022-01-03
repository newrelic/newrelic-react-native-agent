import { Rule, Validator } from '../validator';

export const BreadCrumb = class CustomEvent {
  constructor({ eventName, attributes }) {
    this.eventName = new Rule(eventName,
      [Validator.isString, Validator.notEmptyString],
      `eventName '${eventName}' is not a string.`);
    this.attributes = new Rule(attributes,
      [Validator.isObject, Validator.hasValidAttributes],
      `attributes '${attributes}' are not valid.`);
  }
};

export const NewRelicEvent = class CustomEvent {
  constructor({ eventName = '', attributes, eventType }) {
    this.eventType = new Rule(eventType,
      [Validator.isString, Validator.notEmptyString],
      `eventType '${eventType}' is not a string`);

    this.eventName = new Rule(eventName,
      [Validator.isString],
      `eventName '${eventName}' is not a string`);

    this.attributes = new Rule(attributes,
      [Validator.isObject, Validator.hasValidAttributes],
      `attributes '${attributes}' are not valid.`);
  }
};

export const Attribute = class CustomEvent {
  constructor({ attributeName, value }) {
    this.attributeName = new Rule(attributeName,
      [Validator.isString, Validator.notEmptyString],
      `attributeName '${attributeName}' is not a string`);
    this.attributeValue = new Rule(value, [], `invalid value '${value}' sent to setAttribute()`);
  }
};
