package com.NewRelic;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

public class RNStackTraceExceptionTest {

    RNStackTraceException rnStackTraceException;

    @Before
    public void setUp() throws Exception {
        rnStackTraceException = new RNStackTraceException("bad f00d", "dead beef");
    }

    @Test
    public void getExceptionName() {
        Assert.assertEquals(rnStackTraceException.getExceptionName(), "bad f00d");
    }

    @Test
    public void getCause() {
        Assert.assertEquals(rnStackTraceException.getCause(), "dead beef");
    }
}