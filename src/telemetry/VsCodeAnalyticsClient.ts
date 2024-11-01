/* eslint-disable @typescript-eslint/naming-convention */
import { init as AmplitudeInit } from '@amplitude/node';
import {
  BrowserClient,
  defaultStackParser,
  getDefaultIntegrations,
  makeFetchTransport,
  Scope,
} from '@sentry/browser';
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
export default class VsCodeAnalyticsClient implements IAnalyticsClient {
  static SentryInitialized = false;

  private amplitudeInstance = AmplitudeInit(API_KEY);

  private deviceId = machineIdSync();

  private sessionId = Date.now();

  private userId: string;

  private sentryScope = new Scope();

  private exceptionsSent = new Set<string>();

  constructor(private extensionId: string, private extensionVersion: string) {
    const user = userInfo({ encoding: 'utf8' });
    this.userId = crypto.createHash('md5').update(user.username).digest('hex');
  }

  initialise(): void {
    if (VsCodeAnalyticsClient.SentryInitialized) {
      return;
    }

    VsCodeAnalyticsClient.SentryInitialized = true;

    // https://docs.sentry.io/platforms/javascript/best-practices/shared-environments/

    // filter integrations that use the global variable
    const integrations = getDefaultIntegrations({}).filter((defaultIntegration) => {
      return ![
        'BrowserApiErrors',
        'Breadcrumbs',
        'GlobalHandlers',
        'OnUncaughtException',
        'OnUnhandledRejection',
      ].includes(defaultIntegration.name);
    });

    const client = new BrowserClient({
      dsn: 'https://1035245fc12e491799d0b7a41a9c70a7@o443279.ingest.sentry.io/5613298',
      transport: makeFetchTransport,
      stackParser: defaultStackParser,
      integrations,
      release: `${this.extensionId}@${this.extensionVersion}`,
      // Leaving here for historical reasons
      // not needed anymore, as the client is not not tied to the global scope
      // beforeSend(event) {
      //   // Filter out events that are not from this extension
      //   if (event.extra?.['common.extname'] !== APP_NAME) {
      //     return null;
      //   }

      //   return event;
      // },
    });

    this.sentryScope.setClient(client);
    this.sentryScope.setUser({
      id: this.userId,
    });

    this.sentryScope.setTags({
      deviceId: this.deviceId,
      sessionId: this.sessionId.toString(),
    });

    client.init(); // initializing has to be done after setting the client on the scope
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
    if (!this.exceptionsSent.has(error.message)) {
      this.exceptionsSent.add(error.message);
      const { action, category, label, ...extra } = attributes;

      // When running with the Browser client, I need to clone the scope to get isolated data
      // https://docs.sentry.io/platforms/javascript/best-practices/multiple-sentry-instances/#using-withscope-with-multiple-clients
      const scope = this.sentryScope.clone();

      scope.setTags({
        action,
        category,
        label,
      } as any);

      scope.setExtras(extra);

      scope.captureException(error, {
        data: attributes,
      });
    }
  }
}
