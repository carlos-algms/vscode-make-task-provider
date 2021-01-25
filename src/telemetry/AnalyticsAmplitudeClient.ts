/* eslint-disable @typescript-eslint/naming-convention */
import * as crypto from 'crypto';
import { machineIdSync } from 'node-machine-id';
import { userInfo } from 'os';
import { Event as AnalyticsEvent, Exception, IAnalyticsClient } from 'vscode-extension-analytics';
import { AmplitudeHttpClient } from './AmplitudeHttpClient';

// https://github.com/threadheap/serverless-ide-vscode/blob/master/packages/vscode/src/analytics/index.ts
export default class AnalyticsAmplitudeClient implements IAnalyticsClient {
  private amplitudeInstance: AmplitudeHttpClient;

  private deviceId: string;

  private sessionId: number;

  private userId: string;

  constructor(apiKey: string) {
    const user = userInfo({ encoding: 'utf8' });
    this.amplitudeInstance = new AmplitudeHttpClient(apiKey);
    this.deviceId = machineIdSync();
    this.userId = crypto.createHash('md5').update(user.username).digest('hex');
    this.sessionId = Date.now();
  }

  initialise(): void {
    // noop
  }

  async flush(): Promise<void> {
    await this.amplitudeInstance.dispose();
  }

  sendEvent(event: AnalyticsEvent): void {
    this.track(event.action, event);
  }

  sendException(exception: Exception): void {
    this.track('exception', exception);
  }

  private track(eventType: string, event: AnalyticsEvent | Exception) {
    this.amplitudeInstance.track({
      event_type: eventType,
      user_id: this.userId,
      device_id: this.deviceId,
      session_id: this.sessionId,
      event_properties: event.toJSON(),
    });
  }
}
