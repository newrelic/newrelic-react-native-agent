/*
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */

import StackFrameEditor from '../stack-frame-editor';

describe('Stack Frame Editor', () => {
  it('should parse file names and return properties', () => {
    let stackFrameArr = [
      { fileName: "http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false&modulesOnly=false&runModule=true&app=org.reactjs.native.example.test_app" },
      { fileName: "(native)" },
      { fileName: "path/to/file.js" },
      { fileName: "https://cdn.somewherefast.com/utils.min.js" },
      { fileName: "/Users/test/Library/Developer/Xcode/DerivedData/test_app-randomletters/Build/Products/Release-iphonesimulator/main.jsbundle"}
    ];
    let properties = StackFrameEditor.parseFileNames(stackFrameArr);
    expect(properties).toBeDefined();
    expect(Object.keys(properties).length).toEqual(6);
    expect(stackFrameArr[0].fileName).toEqual("http://localhost:8081/index.bundle");
  });

  it('should not affect regular file names', () => {
    let stackFrameArr = [
      { fileName: "(native)" },
      { fileName: "path/to/file.js" },
      { fileName: "https://cdn.somewherefast.com/utils.min.js" },
      { fileName: "/Users/test/Library/Developer/Xcode/DerivedData/test_app-randomletters/Build/Products/Release-iphonesimulator/main.jsbundle"}
    ];

    let properties = StackFrameEditor.parseFileNames(stackFrameArr);
    expect(properties).toBeDefined();
    expect(Object.keys(properties).length).toEqual(0);
    expect(stackFrameArr[0].fileName).toEqual("(native)");
    expect(stackFrameArr[1].fileName).toEqual("path/to/file.js");
    expect(stackFrameArr[2].fileName).toEqual("https://cdn.somewherefast.com/utils.min.js");

  });

  it('should read properties from bundle file name', () => {
    let properties = StackFrameEditor.readPropertiesFromFileName("http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false&modulesOnly=false&runModule=true&app=org.reactjs.native.example.test_app");
    expect(properties).toBeDefined();
    expect(Object.keys(properties).length).toEqual(6);
    expect(properties.platform).toEqual("ios");
    expect(properties.dev).toEqual("true");
    expect(properties.minify).toEqual("false");
    expect(properties.modulesOnly).toEqual("false");
    expect(properties.runModule).toEqual("true");
    expect(properties.app).toEqual("org.reactjs.native.example.test_app");
  });

  it('should read no properties from regular file names', () => {
    let stackFrameArr = [
      { fileName: "(native)" },
      { fileName: "path/to/file.js" },
      { fileName: "https://cdn.somewherefast.com/utils.min.js" },
      { fileName: "/Users/test/Library/Developer/Xcode/DerivedData/test_app-randomletters/Build/Products/Release-iphonesimulator/main.jsbundle"}
    ];

    for (const obj in stackFrameArr) {
      let properties = StackFrameEditor.readPropertiesFromFileName(obj.fileName);
      expect(properties).toBeDefined();
      expect(Object.keys(properties).length).toEqual(0);
    }
  });

});