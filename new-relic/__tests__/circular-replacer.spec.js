/*
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */

import getCircularReplacer from '../circular-replacer';

describe('Circular replacer', () => {
  it('should remove circular structures when stringified', () => {
    function CircularCreator() {
      this.abc = "Hello";
      this.circular = this;
      this.circular2 = this;
      this.test = "world";
      this.num = 123;
      this.bool = false;
      this.xyz = "Hello";
    }
    
    const circular = new CircularCreator();
    expect(function() { JSON.stringify(circular) }).toThrowError(TypeError);
    expect(function() { JSON.stringify(circular, getCircularReplacer) }).not.toThrowError();

    let jsonStr = JSON.stringify(circular, getCircularReplacer());

    expect(jsonStr).toContain("\"abc\":\"Hello\"");
    expect(jsonStr).not.toContain("circular");
    expect(jsonStr).not.toContain("circular2");
    expect(jsonStr).toContain("\"test\":\"world\"");
    expect(jsonStr).toContain("\"num\":123");
    expect(jsonStr).toContain("\"bool\":false");
    expect(jsonStr).toContain("\"xyz\":\"Hello\"");
  });

  it('should not affect regular objects when stringified', () => {
    let obj = {
      abc: 123,
      def: false,
      ghi: 'testing circular replacer'
    }

    expect(function() { JSON.stringify(obj) }).not.toThrowError();
    expect(function() {JSON.stringify(obj, getCircularReplacer()) }).not.toThrowError();

    let jsonStr = JSON.stringify(obj, getCircularReplacer());
    expect(jsonStr).toContain("\"abc\":123");
    expect(jsonStr).toContain("\"def\":false");
    expect(jsonStr).toContain("\"ghi\":\"testing circular replacer\"");
  });

  it('should work for circular arrays', () => {
    let arr = [];
    let prev = null;
    for(var i = 0; i < 10; ++i) {
      prev = arr[i] =  {
        prev: prev
      }
    }
    arr[0].prev = arr[9];
    
    let jsonStr = JSON.stringify(arr, getCircularReplacer());

    expect(function() { JSON.stringify(arr) }).toThrowError();
    expect(function() { JSON.stringify(arr, getCircularReplacer()) }).not.toThrowError();
    expect(jsonStr).toContain("\"prev\":{");
  });

});