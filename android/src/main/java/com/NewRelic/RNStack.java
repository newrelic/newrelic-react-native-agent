package com.NewRelic;



import java.util.UUID;

class RNStack implements IStack {
    private RNStackFrame[] stackFrames;
    private final String id;

    RNStack(RNStackFrame[] stackFrames) {
        this.stackFrames = stackFrames;
        this.id = UUID.randomUUID().toString();
    }

    @Override
    public String getId() {
        return id;
    }

    @Override
    public boolean isThrowingThread() {
        return true;
    }

    @Override
    public IStackFrame[] getStackFrames() {
        return stackFrames;
    }

}
