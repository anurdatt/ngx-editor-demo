import { Node as ProseMirrorNode } from 'prosemirror-model';
import { EditorView as PMEditorView } from 'prosemirror-view';
import { CodeMirrorView } from 'prosemirror-codemirror-6';
import { minimalSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';

const nodeViews = {
  code_mirror: (
    node: ProseMirrorNode,
    view: PMEditorView,
    getPos: () => number | undefined
  ): CodeMirrorView => {
    return new CodeMirrorView({
      node,
      view,
      getPos,
      cmOptions: {
        extensions: [minimalSetup, javascript()],
      },
    });
  },
};

export default nodeViews;
