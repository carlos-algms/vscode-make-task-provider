import {
  AnalyticsReporter,
  Attributes,
  Event as AnalyticsEvent,
  Exception,
} from 'vscode-extension-analytics';
import AnalyticsAmplitudeClient from './AnalyticsAmplitudeClient';
import packageJSON from '../../package.json';

export { AnalyticsEvent, Exception, Attributes };

const API_KEY = '74556fcd07b7703909928dae21126b7f';

let tracker: AnalyticsReporter | null = null;

const createReporter = (extensionId: string, extensionVersion: string): AnalyticsReporter => {
  const client = new AnalyticsAmplitudeClient(API_KEY);

  return new AnalyticsReporter(extensionId, extensionVersion, client, {
    configId: 'make-task-provider.telemetry',
    configEnabledId: 'enableTelemetry',
  });
};

export function getTracker(): AnalyticsReporter {
  if (!tracker) {
    tracker = createReporter(packageJSON.name, packageJSON.version);
  }

  return tracker;
}

export function trackEvent(name: string, attributes: Attributes = {}): void {
  getTracker().sendEvent(new AnalyticsEvent(name, attributes));
}
