import { AnalyticsReporter, Attributes, Exception } from 'vscode-extension-analytics';
import AmplitudeVsCodeAnalyticsClient, { AnalyticsEvent } from './AmplitudeVsCodeAnalyticsClient';
import packageJSON from '../../package.json';

export type Primitive = string | number | null | undefined;

export interface PrimitiveHash {
  [key: string]: Primitive | Primitive[] | PrimitiveHash | PrimitiveHash[];
}

export type ExceptionAttributes = Attributes & {
  category?: string;
  action?: string;
  label?: string;
  value?: Primitive | Primitive[] | PrimitiveHash | PrimitiveHash[];
};

let tracker: AnalyticsReporter | null = null;

const createReporter = (extensionId: string, extensionVersion: string): AnalyticsReporter => {
  const client = new AmplitudeVsCodeAnalyticsClient();

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

export function trackException(error: Error, attributes: ExceptionAttributes = {}): void {
  getTracker().sendException(new Exception(error, attributes));
}
