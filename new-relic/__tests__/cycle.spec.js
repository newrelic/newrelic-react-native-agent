/*
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */

import decycle from '../cycle';

describe('JSON stringify decycle', () => {

  it('should decycle circular structures for stringify', () => {
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
    expect(function() { JSON.stringify(JSON.decycle(circular)) }).not.toThrowError();

    let jsonStr = JSON.stringify(JSON.decycle(circular));

    expect(jsonStr).toContain("ref");
    expect(jsonStr).toContain("\"abc\":\"Hello\"");
    expect(jsonStr).toContain("\"test\":\"world\"");
    expect(jsonStr).toContain("\"num\":123");
    expect(jsonStr).toContain("\"bool\":false");
    expect(jsonStr).toContain("\"xyz\":\"Hello\"");
  });

  it('should work for non-cyclical objects', () => {
    let obj = {
      abc: 123,
      def: false,
      ghi: 'testing crockford decycle'
    }

    expect(function() { JSON.stringify(obj) }).not.toThrowError();
    expect(function() {JSON.stringify(JSON.decycle(obj))} ).not.toThrowError();
    expect(JSON.stringify(JSON.decycle(obj))).toContain("\"abc\":123");
    expect(JSON.stringify(JSON.decycle(obj))).toContain("\"def\":false");
    expect(JSON.stringify(JSON.decycle(obj))).toContain("\"ghi\":\"testing crockford decycle\"");

  });

  it('should work for arrays', () => {
    let arr = [];
    let prev = null;
    for(var i = 0; i < 10; ++i) {
      prev = arr[i] =  {
        prev: prev
      }
    }
    arr[0].prev = arr[9];

    expect(function() { JSON.stringify(arr) }).toThrowError();
    expect(function() { JSON.stringify(JSON.decycle(arr))}).not.toThrowError();
    expect(JSON.stringify(JSON.decycle(arr))).toContain("ref");
  });

});