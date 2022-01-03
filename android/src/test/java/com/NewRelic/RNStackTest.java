package com.NewRelic;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

public class RNStackTest {

    private RNStack rnStack;
    private RNStackFrame[] stackFrames;

    @Before
    public void setUp() {
        stackFrames = provideStackFrames();
        rnStack = new RNStack(stackFrames);
    }

    @Test
    public void getId() {
        Assert.assertNotNull(rnStack.getId());
        Assert.assertNotEquals(rnStack.getId(), "");
    }

    @Test
    public void isThrowingThread() {
        Assert.assertTrue(rnStack.isThrowingThread());
    }

    @Test
    public void getStackFrames() {
        Assert.assertEquals(rnStack.getStackFrames(), stackFrames);
    }

    private RNStackFrame[] provideStackFrames() {
        return new RNStackFrame[0];
    }

}