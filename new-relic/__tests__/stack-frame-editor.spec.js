/*
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */

import StackFrameEditor from '../stack-frame-editor';

describe('Stack Frame Editor', () => {
  it('should parse file names and return properties', () => {
    let stackFrameArr = [
      { file: "http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false&modulesOnly=false&runModule=true&app=org.reactjs.native.example.test_app" },
      { file: "(native)" },
      { file: "path/to/file.js" },
      { file: "https://cdn.somewherefast.com/utils.min.js" },
      { file: "/Users/test/Library/Developer/Xcode/DerivedData/test_app-randomletters/Build/Products/Release-iphonesimulator/main.jsbundle"}
    ];
    let properties = StackFrameEditor.parseFileNames(stackFrameArr);
    expect(properties).toBeDefined();
    expect(Object.keys(properties).length).toEqual(6);
    expect(stackFrameArr[0].file).toEqual("http://localhost:8081/index.bundle");
  });

  it('should not affect regular file names', () => {
    let stackFrameArr = [
      { file: "(native)" },
      { file: "path/to/file.js" },
      { file: "https://cdn.somewherefast.com/utils.min.js" },
      { file: "/Users/test/Library/Developer/Xcode/DerivedData/test_app-randomletters/Build/Products/Release-iphonesimulator/main.jsbundle"}
    ];

    let properties = StackFrameEditor.parseFileNames(stackFrameArr);
    expect(properties).toBeDefined();
    expect(Object.keys(properties).length).toEqual(0);
    expect(stackFrameArr[0].file).toEqual("(native)");
    expect(stackFrameArr[1].file).toEqual("path/to/file.js");
    expect(stackFrameArr[2].file).toEqual("https://cdn.somewherefast.com/utils.min.js");

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
      { file: "(native)" },
      { file: "path/to/file.js" },
      { file: "https://cdn.somewherefast.com/utils.min.js" },
      { file: "/Users/test/Library/Developer/Xcode/DerivedData/test_app-randomletters/Build/Products/Release-iphonesimulator/main.jsbundle"}
    ];

    for (const obj in stackFrameArr) {
      let properties = StackFrameEditor.readPropertiesFromFileName(obj.file);
      expect(properties).toBeDefined();
      expect(Object.keys(properties).length).toEqual(0);
    }
  });

});