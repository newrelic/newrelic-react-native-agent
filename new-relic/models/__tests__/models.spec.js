import { Attribute, BreadCrumb, NewRelicEvent } from '../index';

let breadCrumb = null;
let newRelicEvent = null;
let emptyNewRelicEvent = null;
let invalidNewRelicEvent = null;

let attribute = null;

describe('Models', () => {
  describe('BreadCrumb', () => {
    beforeEach(() => {
      breadCrumb = new BreadCrumb({ eventName: 'testName', attributes: { test: true } });
    });

    it('should have a valid event name', () => {
      expect(breadCrumb.eventName.isValid()).toBe(true);
    });

    it('should have valid attributes', () => {
      expect(breadCrumb.attributes.isValid()).toBe(true);
    });
  });

  describe('NewRelicEvent', () => {
    beforeEach(() => {
      newRelicEvent = new NewRelicEvent({
        eventName: 'testName',
        eventType: 'testType',
        attributes: { test: true },
      });

      emptyNewRelicEvent = new NewRelicEvent({
        eventType: 'testType',
        attributes: { test: true },
      });

      invalidNewRelicEvent = new NewRelicEvent({
        eventType: 'testType',
        attributes: { test: true },
      });
    });

    it('should have a valid event name', () => {
      expect(newRelicEvent.eventName.isValid()).toBe(true);
      expect(emptyNewRelicEvent.eventName.isValid()).toBe(true);
    });

    it('should have valid attributes', () => {
      expect(newRelicEvent.attributes.isValid()).toBe(true);
      expect(emptyNewRelicEvent.attributes.isValid()).toBe(true);
    });

    it('should have valid eventType', () => {
      expect(newRelicEvent.eventType.isValid()).toBe(true);
      expect(emptyNewRelicEvent.eventType.isValid()).toBe(true);
    });
  });

  describe('Attribute', () => {
    beforeEach(() => {
      attribute = new Attribute({
        attributeName: 'testName',
        value: 'testType',
      });
    });

    it('should have a valid event name', () => {
      expect(attribute.attributeName.isValid()).toBe(true);
    });

    it('should have valid attributes', () => {
      expect(attribute.attributeValue.isValid()).toBe(true);
    });
  });
});
