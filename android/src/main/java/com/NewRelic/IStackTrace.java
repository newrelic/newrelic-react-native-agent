package com.NewRelic;

import java.util.Map;

public interface IStackTrace {
    String getStackId();
    String getStackType();
    boolean isFatal();
    IStack[] getStacks();
    IStackTraceException getStackTraceException();
    String getBuildId();
    Map<String, Object> getCustomAttributes();

}
