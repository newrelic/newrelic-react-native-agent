package com.NewRelic;

public interface IStackFrame {
    String getClassName();
    String getMethodName();
    String getFileName();
    String getRawSourceLine();
    int getLineNumber();
    int getColumnNumber();
}
