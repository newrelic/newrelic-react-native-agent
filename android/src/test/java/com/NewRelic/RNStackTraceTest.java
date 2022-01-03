package com.NewRelic;


import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

public class RNStackTraceTest {

    IStackTrace rnStackTrace;

    @Before
    public void setUp() throws Exception {
        // RNStackTrace(String errorName, String errorMessage, String errorStack, boolean isFatal, String buildId) {
        rnStackTrace = new RNStackTrace("errorName", "errorMessage", "errorStack", true, "buildId");
    }

    @Test
    public void getStackId() {
        Assert.assertNotNull(rnStackTrace.getStackId());
        Assert.assertNotEquals(rnStackTrace.getStackId(), "");
    }

    @Test
    public void isFatal() {
        Assert.assertTrue(rnStackTrace.isFatal());
    }

    @Test
    public void getStacks() {
        Assert.assertNull(rnStackTrace.getStacks());
    }

    @Test
    public void getStackTraceException() {
        Assert.assertNotNull(rnStackTrace.getStackTraceException());
    }

    @Test
    public void getBuildId() {
        Assert.assertEquals(rnStackTrace.getBuildId(), "buildId");
    }
}