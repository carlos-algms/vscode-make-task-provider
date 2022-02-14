import { getSelectionForTarget } from './selectionFinder';

describe('Selection Finder', () => {
  const text = `foo:
  \techo foo

  bar:
  \techo bar
  `;

  it('should find the target and select it', () => {
    const target = 'bar';
    const selection = getSelectionForTarget(text, target);

    const { anchor, active } = selection;
    [anchor.line, anchor.character, active.line, active.character].should.eql([
      3,
      0,
      3,
      target.length + 1,
    ]);
  });

  it('should just open the file on the beginning when a target is not found', () => {
    const target = 'baz';
    const selection = getSelectionForTarget(text, target);

    const { anchor, active } = selection;
    [anchor.line, anchor.character, active.line, active.character].should.eql([0, 0, 0, 0]);
  });

  it('should open the file on the beginning if no target name was provided', () => {
    const target = undefined;
    const selection = getSelectionForTarget(text, target);

    const { anchor, active } = selection;
    [anchor.line, anchor.character, active.line, active.character].should.eql([0, 0, 0, 0]);
  });
});
