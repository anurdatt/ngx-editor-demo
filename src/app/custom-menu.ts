import { Component, Input, OnInit } from '@angular/core';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { setBlockType } from 'prosemirror-commands';
import { CommonModule } from '@angular/common';

import { Editor } from 'ngx-editor';
import { isNodeActive } from 'ngx-editor/helpers';

@Component({
  selector: 'app-custom-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="NgxEditor__Seperator"></div>
    <div
      class="NgxEditor__MenuItem NgxEditor__MenuItem--Text"
      (mousedown)="onClick($event)"
      [ngClass]="{
        'NgxEditor__MenuItem--Active': isActive,
        'NgxEditor--Disabled': isDisabled
      }"
    >
      CodeMirror
    </div>
  `,
  styles: [':host {display: flex}'],
})
export class CustomMenuComponent implements OnInit {
  constructor() {}

  @Input() editor!: Editor;
  isActive = false;
  isDisabled = false;

  onClick(e: MouseEvent): void {
    e.preventDefault();
    const { state, dispatch } = this.editor.view;
    this.execute(state, dispatch);
  }

  execute(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
    const { schema } = state;

    if (this.isActive) {
      return setBlockType(schema.nodes['paragraph'])(state, dispatch);
    }

    return setBlockType(schema.nodes['code_mirror'])(state, dispatch);
  }

  update = (view: EditorView) => {
    const { state } = view;
    const { schema } = state;
    this.isActive = isNodeActive(state, schema.nodes['code_mirror']);
    this.isDisabled = !this.execute(state, undefined); // returns true if executable
  };

  ngOnInit(): void {
    this.editor.update.subscribe((view: EditorView) => this.update(view));
  }
}

// import {
//   Editor as NgxEditor,
//   NgxEditorService,
// } from 'ngx-editor';
// import { Schema, Node } from 'prosemirror-model';

import { Schema } from 'prosemirror-model';

// Assuming you've defined your custom schema and node views
// import customSchema from './custom-schema';
// import customNodeViews from './custom-node-views';
import { nodes as basicNodes, marks } from 'ngx-editor';
import schema from './schema';

export class CustomEditor {
  private editor: any; // Replace 'any' with the actual Editor type if available
  constructor() {
    // Create a new schema instance using your custom schema
    // const schema = new Schema(customSchema);

    // Create an editor instance with the custom schema
    this.editor = new EditorView(document.createElement('div'), {
      state: EditorState.create({
        schema,
      }),
      nodeViews: {
        video(node: any, view: any, getPos: any) {
          return new VideoNodeView(node, view, getPos);
        },
      },
    });
  }

  insertVideo(url: string): void {
    // // Create the video node using the custom schema
    // const videoNode = this.schema.node('video', { src: url });

    // // Insert the video node into the editor at the current cursor position
    // this.view.dispatch(this.view.state.tr.replaceSelectionWith(videoNode));

    const { state, dispatch } = this.editor;

    // Create the video node using the custom schema
    const videoNode = state.schema.nodes['video'].create({ src: url });

    // Insert the video node into the editor at the current cursor position
    dispatch(state.tr.replaceSelectionWith(videoNode));
  }
}

import { Node as PMNode } from 'prosemirror-model';
import { EditorView as PMEditorView, NodeView } from 'prosemirror-view';

export class VideoNodeView implements NodeView {
  dom: HTMLDivElement;

  constructor(private node: PMNode, view: PMEditorView, getPos: () => number) {
    this.dom = document.createElement('div');
    this.dom.contentEditable = 'false';
    this.dom.innerHTML = `<video src="${
      (node.attrs as { src: string }).src
    }" controls></video>`;
  }
  // contentDOM?: HTMLElement | null | undefined;
  // selectNode?: (() => void) | undefined;
  // deselectNode?: (() => void) | undefined;
  // setSelection?: ((anchor: number, head: number, root: Document | ShadowRoot) => void) | undefined;

  destroy() {
    // Cleanup logic if needed
  }

  ignoreMutation() {
    return true;
  }

  stopEvent(event: Event) {
    return true;
  }

  update(node: PMNode) {
    return node.sameMarkup(this.node);
  }
}
