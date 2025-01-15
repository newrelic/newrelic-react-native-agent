import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {

  startAgent(appkey:string,agentVersion:string,reactNativeVersion:string,customerConfiguration:Object): void;
  analyticsEventEnabled(enabled:boolean): void;
  networkRequestEnabled(enabled:boolean): void;
  networkErrorRequestEnabled(enabled:boolean): void;
  httpResponseBodyCaptureEnabled(enabled:boolean): void;
  recordBreadcrumb(eventName:string, attributes:Object): void;
  recordCustomEvent(eventType:string,eventName:string, attributes:Object): void;
  crashNow(message:string): void;
  currentSessionId(): Promise<string>;
  noticeHttpTransaction(url :string, httpMethod :string, statusCode:number, startTime:number, endTime:number, bytesSent:number, bytesReceived:number, responseBody :string): void;
  addHTTPHeadersTrackingFor(headers:Array<string>): void;
  noticeNetworkFailure(url :string, httpMethod :string,startTime:number, endTime:number,failure: string): void;
  recordMetric(name:string, category:string, value :number, countUnit:string, valueUnit:string): void;
  removeAllAttributes(): void;
  setMaxEventBufferTime(maxEventBufferTime:number): void;
  setMaxEventPoolSize(maxSize:number): void;
  setMaxOfflineStorageSize(megaBytes:number): void;
  startInteraction(name:string): Promise<string>;
  endInteraction(interactionId:string): void;
  setInteractionName(name:string): void;
  removeAttribute(name:string): void;
  logAttributes(attributes:Object): void;
  incrementAttribute(attributeName:string, value:number): void;
  setJSAppVersion(version:string): void;
  setUserId(userId:string): void;
  shutdown(): void;
  recordHandledException(exceptionDictionary:Object): void;
  recordStack(name:string,message:string, stack:string,isFatal:boolean,jsAppVersion:string): void;
  setStringAttribute(name:string, value:string): void;
  setNumberAttribute(name:string, value:number): void;
  setBoolAttribute(name:string, value:boolean): void;
  isAgentStarted(): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NRMModularAgent') as Spec | null;