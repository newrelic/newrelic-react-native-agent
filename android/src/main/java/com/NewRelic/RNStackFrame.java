package com.NewRelic;


import java.util.regex.Matcher;
import java.util.regex.Pattern;

// Reference: https://github.com/facebook/react-native/blob/1151c096dab17e5d9a6ac05b61aacecd4305f3db/ReactAndroid/src/main/java/com/facebook/react/devsupport/StackTraceHelper.java
class RNStackFrame implements IStackFrame {
    private String method;
    private int line;
    private int column;
    private String fileName;
    private final String rawJsLine;

    private static final Pattern STACK_FRAME_PATTERN1 = Pattern.compile(
            "^(?:(.*?)@)?(.*?)\\:([0-9]+)\\:([0-9]+)$");
    private static final Pattern STACK_FRAME_PATTERN2 = Pattern.compile(
            "\\s*(?:at)\\s*(.+?)\\s*[@(](.*):([0-9]+):([0-9]+)[)]$");

    RNStackFrame(String rawJsLine) {
        this.rawJsLine = rawJsLine.trim();
        parseRawJS();
    }

    private void parseRawJS() {
        Matcher matcher1 = STACK_FRAME_PATTERN1.matcher(rawJsLine);
        Matcher matcher2 = STACK_FRAME_PATTERN2.matcher(rawJsLine);
        Matcher matcher;
        if (matcher2.find()) {
            matcher = matcher2;
        } else if (matcher1.find()) {
            matcher = matcher1;
        } else {
            fileName = null;
            method = rawJsLine;
            line = -1;
            column = -1;
            return;
        }

        fileName = matcher.group(2);
        method = matcher.group(1) == null ? "(unknown)" : matcher.group(1);
        line = Integer.parseInt(matcher.group(3));
        column = Integer.parseInt(matcher.group(4));
    }

    @Override
    public String getClassName() {
        return null;
    }

    @Override
    public String getMethodName() {
        return method;
    }

    @Override
    public String getFileName() {
        return fileName;
    }

    @Override
    public String getRawSourceLine() {
        return rawJsLine;
    }

    @Override
    public int getLineNumber() {
        return line;
    }

    @Override
    public int getColumnNumber() {
        return column;
    }
}
