import com.NewRelic.IStack;
import com.NewRelic.IStackFrame;
import com.NewRelic.RNStackTrace;


import org.junit.Test;
import static org.junit.Assert.*;
import java.util.UUID;

public class RNStackParsingTest {
    public static final String BUILD_ID = UUID.randomUUID().toString();

    private String userThrownDevErrorName = "Error";
    private String userThrownDevErrorMessage = "PANICCCC";
    private final String userThrownDevErrorStack = "Error: PANICCCC\n" +
            "    at AppContainer.toggleOverlay (blob:http://localhost:8081/35c33d6c-66e9-437d-81a6-43a7a2649dba:85900:15)\n" +
            "    at AppContainer.proxiedMethod (blob:http://localhost:8081/35c33d6c-66e9-437d-81a6-43a7a2649dba:42344:32)\n" +
            "    at Object.onPress (blob:http://localhost:8081/35c33d6c-66e9-437d-81a6-43a7a2649dba:86293:13)\n" +
            "    at Object.touchableHandlePress (blob:http://localhost:8081/35c33d6c-66e9-437d-81a6-43a7a2649dba:60412:40)\n" +
            "    at Object._performSideEffectsForTransition (blob:http://localhost:8081/35c33d6c-66e9-437d-81a6-43a7a2649dba:45166:16)\n" +
            "    at Object._receiveSignal (blob:http://localhost:8081/35c33d6c-66e9-437d-81a6-43a7a2649dba:45095:14)\n" +
            "    at Object.touchableHandleResponderRelease (blob:http://localhost:8081/35c33d6c-66e9-437d-81a6-43a7a2649dba:44974:12)\n" +
            "    at Object.invokeGuardedCallbackImpl (blob:http://localhost:8081/35c33d6c-66e9-437d-81a6-43a7a2649dba:7909:16)\n" +
            "    at invokeGuardedCallback (blob:http://localhost:8081/35c33d6c-66e9-437d-81a6-43a7a2649dba:8000:37)\n" +
            "    at invokeGuardedCallbackAndCatchFirstError (blob:http://localhost:8081/35c33d6c-66e9-437d-81a6-43a7a2649dba:8004:31)";

    @Test(expected = IllegalArgumentException.class)
    public void testParsingThrowsInvalidArgExceptionWithEmptyStack() {
        RNStackTrace nope = new RNStackTrace("", "", "", false, BUILD_ID);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testParsingThrowsInvalidArgExceptionWithNullStack() {
        RNStackTrace nope = new RNStackTrace(null, null, null, false, BUILD_ID);
    }

    @Test
    public void testParsingDoesItsBestWithANonStack() {
        String someRandomString = "SashaRules blah blah:2000";
        RNStackTrace stackTrace = new RNStackTrace("", "", someRandomString, false, BUILD_ID);

        assertNotNull(stackTrace.getStackId());
        assertNull(stackTrace.getStacks());
        assertFalse(stackTrace.isFatal());
        assertNotNull(stackTrace.getStackTraceException());
        assertEquals(someRandomString, stackTrace.getStackTraceException().getCause());
        assertEquals(someRandomString, stackTrace.getStackTraceException().getExceptionName());
    }

    @Test
    public void testParsingJSStack() {
        RNStackTrace stackTrace = new RNStackTrace(userThrownDevErrorName, userThrownDevErrorMessage, userThrownDevErrorStack, true, BUILD_ID);
        validateAgainstUserThrownDevError(stackTrace);
    }

    private void validateAgainstUserThrownDevError(RNStackTrace stackTrace) {
        assertNotNull(stackTrace.getStackId());
        assertTrue(stackTrace.isFatal());
        assertNotNull(stackTrace.getStackTraceException());
        assertEquals(userThrownDevErrorMessage, stackTrace.getStackTraceException().getCause());
        assertEquals(userThrownDevErrorName, stackTrace.getStackTraceException().getExceptionName());
        assertNotNull(stackTrace.getStacks());
        assertEquals(1, stackTrace.getStacks().length);
        assertNotNull(stackTrace.getStacks()[0]);

        IStack jsStack = stackTrace.getStacks()[0];
        assertNotNull(jsStack.getId());
        assertTrue(jsStack.isThrowingThread());
        assertEquals(10, jsStack.getStackFrames().length);

        IStackFrame firstStackFrame = jsStack.getStackFrames()[0];
        IStackFrame middleStackFrame = jsStack.getStackFrames()[4];
        IStackFrame lastStackFrame = jsStack.getStackFrames()[9];

        assertNotNull(firstStackFrame);
        assertEquals("AppContainer.toggleOverlay", firstStackFrame.getMethodName());
        assertEquals("blob:http://localhost:8081/35c33d6c-66e9-437d-81a6-43a7a2649dba", firstStackFrame.getFileName());
        assertNull(firstStackFrame.getClassName());
        assertEquals(85900, firstStackFrame.getLineNumber());
        assertEquals(15, firstStackFrame.getColumnNumber());
        assertEquals("at AppContainer.toggleOverlay (blob:http://localhost:8081/35c33d6c-66e9-437d-81a6-43a7a2649dba:85900:15)", firstStackFrame.getRawSourceLine());


        assertNotNull(middleStackFrame);
        assertEquals("Object._performSideEffectsForTransition", middleStackFrame.getMethodName());
        assertEquals("blob:http://localhost:8081/35c33d6c-66e9-437d-81a6-43a7a2649dba", middleStackFrame.getFileName());
        assertNull(middleStackFrame.getClassName());
        assertEquals(45166, middleStackFrame.getLineNumber());
        assertEquals(16, middleStackFrame.getColumnNumber());
        assertEquals("at Object._performSideEffectsForTransition (blob:http://localhost:8081/35c33d6c-66e9-437d-81a6-43a7a2649dba:45166:16)", middleStackFrame.getRawSourceLine());

        assertNotNull(lastStackFrame);
        assertEquals("invokeGuardedCallbackAndCatchFirstError", lastStackFrame.getMethodName());
        assertEquals("blob:http://localhost:8081/35c33d6c-66e9-437d-81a6-43a7a2649dba", lastStackFrame.getFileName());
        assertNull(lastStackFrame.getClassName());
        assertEquals(8004, lastStackFrame.getLineNumber());
        assertEquals(31, lastStackFrame.getColumnNumber());
        assertEquals("at invokeGuardedCallbackAndCatchFirstError (blob:http://localhost:8081/35c33d6c-66e9-437d-81a6-43a7a2649dba:8004:31)", lastStackFrame.getRawSourceLine());
    }

}
