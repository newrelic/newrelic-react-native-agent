package com.NewRelic;


class RNStackTraceException implements IStackTraceException {
    final private String name;
    final private String cause;

    RNStackTraceException(String name, String cause) {
        this.name = name;
        this.cause = cause;
    }

    @Override
    public String getExceptionName() {
        return name;
    }

    @Override
    public String getCause() {
        return cause;
    }
}
