export default class DisposeManager {
  readonly disposables: DisposeLike[] = [];

  dispose(): void {
    for (const d of this.disposables) {
      d.dispose();
    }
  }
}
