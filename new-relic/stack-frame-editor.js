/*
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */

export default class StackFrameEditor {
  // Matches all instances of "&property=word or ?property=word" in string
  static fileNameRegex = /[\\?|&]([a-zA-Z]*)=([a-zA-Z-._]*)/g
  
  // Input should be output of error-stack-parser parse
  static parseFileNames(stackFramesArr) {
    let hasReadProperties = false;
    let properties = {};

    if(stackFramesArr == null || stackFramesArr == undefined) {
      return properties;
    }
    for(const stackFrame of stackFramesArr) {
      // This should only be done once since it will be the same for other filenames in the stack trace
      if(!hasReadProperties) {
        if(RegExp(this.fileNameRegex, 'g').test(stackFrame.fileName)) {
          hasReadProperties = true;
          properties = this.readPropertiesFromFileName(stackFrame.fileName);
        }
        this.readPropertiesFromFileName(stackFrame.fileName);
      }
      stackFrame.fileName = stackFrame.fileName.replace(this.fileNameRegex, '');
    }
    return properties;
  }

  static readPropertiesFromFileName(fileName) {
    const regex = RegExp(this.fileNameRegex, 'g');
    let regexArr;
    let properties = {};
    while((regexArr = regex.exec(fileName)) !== null) {
      properties[regexArr[1]] = regexArr[2];
    }
    return properties;
  }
}