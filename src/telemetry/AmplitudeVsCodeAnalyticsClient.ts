/* eslint-disable @typescript-eslint/naming-convention */
import { init as AmplitudeInit } from '@amplitude/node';
import * as Sentry from '@sentry/node';
import * as crypto from 'crypto';
import { machineIdSync } from 'node-machine-id';
import { userInfo } from 'os';
import {
  Event as AnalyticsEvent,
  Exception as AnalyticsException,
  IAnalyticsClient,
} from 'vscode-extension-analytics';

export { AnalyticsEvent, AnalyticsException };

const API_KEY = '74556fcd07b7703909928dae21126b7f';

// https://github.com/threadheap/serverless-ide-vscode/blob/master/packages/vscode/src/analytics/index.ts
export default class AmplitudeVsCodeAnalyticsClient implements IAnalyticsClient {
  private amplitudeInstance = AmplitudeInit(API_KEY);

  private deviceId = machineIdSync();

  private sessionId = Date.now();

  private userId: string;

  private exceptionsSent = new Set<string>();

  constructor(private extensionId: string, private extensionVersion: string) {
    const user = userInfo({ encoding: 'utf8' });
    this.userId = crypto.createHash('md5').update(user.username).digest('hex');
  }

  initialise(): void {
    Sentry.init({
      dsn: 'https://1035245fc12e491799d0b7a41a9c70a7@o443279.ingest.sentry.io/5613298',
      integrations: (integrations) =>
        integrations.filter(
          (integration) =>
            integration.name !== 'OnUncaughtException' &&
            integration.name !== 'OnUnhandledRejection',
        ),
      release: `${this.extensionId}@${this.extensionVersion}`,
    });

    Sentry.configureScope((scope) => {
      scope.setUser({
        id: this.userId,
      });

      scope.setTags({
        deviceId: this.deviceId,
        sessionId: this.sessionId.toString(),
      });
    });
  }

  async flush(): Promise<void> {
    await this.amplitudeInstance.flush();
  }

  sendEvent(event: AnalyticsEvent): void {
    this.amplitudeInstance.logEvent({
      event_type: event.action,
      user_id: this.userId,
      device_id: this.deviceId,
      session_id: this.sessionId,
      event_properties: event.toJSON(),
    });
  }

  sendException({ error, attributes }: AnalyticsException): void {
    const { action, category, label, ...extra } = attributes;

    if (!this.exceptionsSent.has(error.message)) {
      this.exceptionsSent.add(error.message);

      Sentry.captureException(error, {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tags: { action, category, label } as any,
        extra,
      });
    }
  }
}
