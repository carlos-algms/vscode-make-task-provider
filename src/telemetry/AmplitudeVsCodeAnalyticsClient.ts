/* eslint-disable @typescript-eslint/naming-convention */
import * as crypto from 'crypto';
import { machineIdSync } from 'node-machine-id';
import { userInfo } from 'os';
import {
  Event as AnalyticsEvent,
  Exception as AnalyticsException,
  IAnalyticsClient,
} from 'vscode-extension-analytics';
import { init as AmplitudeInit } from '@amplitude/node';

export { AnalyticsEvent, AnalyticsException };

const API_KEY = '74556fcd07b7703909928dae21126b7f';

// https://github.com/threadheap/serverless-ide-vscode/blob/master/packages/vscode/src/analytics/index.ts
export default class AmplitudeVsCodeAnalyticsClient implements IAnalyticsClient {
  private amplitudeInstance = AmplitudeInit(API_KEY);

  private deviceId = machineIdSync();

  private sessionId = Date.now();

  private userId: string;

  constructor() {
    const user = userInfo({ encoding: 'utf8' });
    this.userId = crypto.createHash('md5').update(user.username).digest('hex');
  }

  initialise(): void {
    // noop
  }

  async flush(): Promise<void> {
    await this.amplitudeInstance.flush();
  }

  sendEvent(event: AnalyticsEvent): void {
    this.track(event.action, event);
  }

  sendException(exception: AnalyticsException): void {
    this.track('exception', exception);
  }

  private track(eventType: string, event: AnalyticsEvent | AnalyticsException) {
    this.amplitudeInstance.logEvent({
      event_type: eventType,
      user_id: this.userId,
      device_id: this.deviceId,
      session_id: this.sessionId,
      event_properties: event.toJSON(),
    });
  }
}
