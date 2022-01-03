package com.NewRelic;

public interface IStack {
    String getId();
    boolean isThrowingThread();
    IStackFrame[] getStackFrames();
}