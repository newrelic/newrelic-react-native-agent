package com.NewRelic;

public class NewRelicReactNativeException extends Exception {
    public NewRelicReactNativeException(String message, StackTraceElement[] stackTraceElements) {
        super(message);
        setStackTrace(stackTraceElements);
    }
}
