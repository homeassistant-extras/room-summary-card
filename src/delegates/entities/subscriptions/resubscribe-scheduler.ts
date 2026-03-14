/**
 * Debounces resubscribe to batch rapid entity add/remove during dashboard load.
 */

const RESUBSCRIBE_DEBOUNCE_MS = 50;

/** Debounces a callback; call schedule() to run fn after a short delay, reset on each call. */
export class ResubscribeScheduler {
  private _timer: ReturnType<typeof setTimeout> | undefined;

  /** Run fn after debounce delay; resets timer if called again before firing. */
  schedule(fn: () => void): void {
    if (this._timer) {
      clearTimeout(this._timer);
    }
    this._timer = setTimeout(() => {
      this._timer = undefined;
      fn();
    }, RESUBSCRIBE_DEBOUNCE_MS);
  }

  /** Cancel any pending scheduled run. */
  cancel(): void {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }
  }
}
