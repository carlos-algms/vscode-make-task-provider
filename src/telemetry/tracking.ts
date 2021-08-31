import { AnalyticsReporter, Attributes } from 'vscode-extension-analytics';

import { name, version } from '../../package.json';
import getOutputChannel from '../shared/getOutputChannel';

import AmplitudeVsCodeAnalyticsClient, {
  AnalyticsEvent,
  AnalyticsException,
} from './AmplitudeVsCodeAnalyticsClient';

export type Primitive = string | number | null | undefined;

export interface PrimitiveHash {
  [key: string]: Primitive | Primitive[] | PrimitiveHash | PrimitiveHash[];
}

export type StandardAttributes = Attributes & {
  action: string;
  category?: string; // TODO investigate create an enum to avoid Typos
  label?: string;
  value?: Primitive | Primitive[] | PrimitiveHash | PrimitiveHash[];
};

let tracker: AnalyticsReporter | null = null;

const createReporter = (extensionId: string, extensionVersion: string): AnalyticsReporter => {
  const client = new AmplitudeVsCodeAnalyticsClient(extensionId, extensionVersion);

  return new AnalyticsReporter(extensionId, extensionVersion, client, {
    configId: 'make-task-provider.telemetry',
    configEnabledId: 'enableTelemetry',
  });
};

export function getTracker(): AnalyticsReporter {
  if (!tracker) {
    tracker = createReporter(name, version);
  }

  return tracker;
}

export function trackEvent(attributes: StandardAttributes): void {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    getOutputChannel().appendLine(
      `Not tracking event in development: ${JSON.stringify(attributes, null, 2)}`,
    );
    return;
  }

  getTracker().sendEvent(new AnalyticsEvent(attributes.action, attributes));
}

export function trackException(error: Error, attributes: StandardAttributes): void {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    getOutputChannel().appendLine(
      `Not tracking Exception in development: ${JSON.stringify(attributes, null, 2)}`,
    );
    return;
  }

  getTracker().sendException(new AnalyticsException(error, attributes));
}

/**
 * Awaits for a callback execution and track the execution duration
 * @returns the callback return value
 */
export async function trackExecutionTime<T>(
  cb: () => T | Promise<T>,
  { category, label }: { category?: string; label: string },
): Promise<T> {
  const start = Date.now();
  const result = await cb();
  const duration = Date.now() - start;

  trackEvent({
    action: 'Timing',
    category,
    label,
    value: duration,
  });

  return result;
}
