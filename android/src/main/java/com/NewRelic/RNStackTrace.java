package com.NewRelic;



import java.util.HashMap;
import java.util.Map;
import java.util.Stack;
import java.util.UUID;

public class RNStackTrace implements IStackTrace {
    final private UUID stackId;
    final private boolean isFatal;
    final private IStackTraceException rnStackTraceException;
    final private String buildId;
    private IStack[] rnStacks = null;
    private Map<String, Object> attributes = new HashMap<>();

    public RNStackTrace(String errorName, String errorMessage, String errorStack, boolean isFatal, String buildId) {
        this(errorName, errorMessage, errorStack, isFatal, buildId, null);
    }

    public RNStackTrace(String errorName, String errorMessage, String errorStack, boolean isFatal, String buildId, Map<String, Object> attributes) {
        if(errorStack == null || errorStack.isEmpty()) {
            throw new IllegalArgumentException("Cannot create a RNStackTrace without a stack.");
        }

        this.stackId = UUID.randomUUID();
        this.isFatal = isFatal;
        this.buildId = buildId;

        if (attributes != null) {
            this.attributes = attributes;
        }

        String[] stringStackTrace = errorStack.split("\n");
        String exName = errorName;
        String exCause = errorMessage;
        if (errorName == null || errorName.isEmpty()) {
            exName = errorStack.split("\n")[0];
        }
        if (errorMessage == null || errorMessage.isEmpty()) {
            exCause = errorStack.split("\n")[0];
        }
        rnStackTraceException = new RNStackTraceException(exName, exCause);

        // skip the first line (errorName: errorMessage)
        int stackLength = stringStackTrace.length - 1;
        if (stackLength > 0) {
            RNStackFrame[] rnStackFrames = new RNStackFrame[stackLength];
            for (int i = 1; i < stackLength + 1; ++i) {
                RNStackFrame frame = new RNStackFrame(stringStackTrace[i]);
                rnStackFrames[i - 1] = frame;
            }
            rnStacks = new RNStack[1];
            rnStacks[0] = new RNStack(rnStackFrames);
        }
    }

    @Override
    public String getStackId() {
        return stackId.toString();
    }

    @Override
    public String getStackType() {
        return "ReactNative";
    }

    @Override
    public boolean isFatal() {
        return isFatal;
    }

    @Override
    public IStack[] getStacks() {
        return rnStacks;
    }

    @Override
    public IStackTraceException getStackTraceException() {
        return rnStackTraceException;
    }

    @Override
    public String getBuildId() {
        return buildId;
    }

    @Override
    public Map<String, Object> getCustomAttributes() {
        return attributes;
    }

}
