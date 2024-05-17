import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  AbstractControl,
} from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Editor, NgxEditorModule, Toolbar, toHTML } from 'ngx-editor';
import { BehaviorSubject } from 'rxjs';

import jsonDoc from './doc';
import schema from './schema';
import nodeViews from './nodeviews';
import { CustomMenuComponent } from './custom-menu';

import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
hljs.registerLanguage('javascript', javascript);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxEditorModule,
    CustomMenuComponent,
  ],
  // encapsulation: ViewEncapsulation.None,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'ngx-editor-demo';
  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  html: string | any = '';
  renderedHtml: SafeHtml = '';

  aa: BehaviorSubject<string | any> = new BehaviorSubject('');

  form = new FormGroup({
    editorContent: new FormControl({ value: jsonDoc, disabled: false }),
  });

  get doc(): AbstractControl {
    return this.form.get('editorContent') as AbstractControl;
  }

  constructor(public sanitizer: DomSanitizer, private http: HttpClient) {
    // this.editor = new Editor();
  }

  ngOnInit(): void {
    this.editor = new Editor({
      schema,
      nodeViews,
    });
  }

  ngAfterViewInit(): void {
    const docJson = this.doc.getRawValue();
    console.log(`doc = ${JSON.stringify(docJson)}`);
    this.html = toHTML(docJson, schema);
    this.renderedHtml = this.sanitizer.bypassSecurityTrustHtml(this.html);

    document.addEventListener('DOMContentLoaded', (event) => {
      document.querySelectorAll('pre code').forEach((el) => {
        return hljs.highlightElement(el as HTMLElement);
      });
    });

    setInterval(() => {
      // console.log(`html = ${this.html}`);
      const docJson = this.doc.getRawValue();
      console.log(`doc = ${JSON.stringify(docJson)}`);
      this.html = toHTML(docJson, schema);
      this.renderedHtml = this.sanitizer.bypassSecurityTrustHtml(this.html);

      console.log({ renderedHtml: this.renderedHtml });
      console.log({ 'aa?.value': this.aa?.value });
      if (this.renderedHtml.toString() != this.aa?.value.toString()) {
        this.aa?.next(this.renderedHtml);
        console.log(`html = ${this.html}`);
        // console.log(`json = ${docJson}`);
      }

      document.querySelectorAll('pre code').forEach((el) => {
        if (el.classList.contains('hljs')) {
          console.log('class hljs foud.. strange!');
        } else {
          // (hljs.initHighlighting() as any)['called'] = false;
          hljs.initHighlighting();
          return hljs.highlightElement(el as HTMLElement);
        }
      });

      // hljs.highlightAll();
    }, 5000);
  }
  ngOnDestroy(): void {
    this.editor.destroy();
  }

  @HostListener('window:scroll', ['$event'])
  OnScroll($event: any) {
    console.log('Scroll event : ' + JSON.stringify($event));
    console.log('window scrol top = ' + window.scrollY);
  }

  insertImage(url: string): void {
    this.editor.commands.insertImage(url, { width: '150px' }).exec();
  }

  uploadImage(event: Event) {
    const file = (event.target as HTMLInputElement).files![0];
    if (file) {
      // const formData = new FormData();
      // formData.append('image', file);

      const headers = new HttpHeaders().set(
        'Content-Type',
        'application/octet-stream'
      );
      // .set('Accept', 'text/plain');
      this.http
        .put(
          `https://tsw1pqoa9d.execute-api.us-east-1.amazonaws.com/Stage/courses/api/media/upload?bucketName=lng-courses&fileName=thumbnails/${file.name}`,
          file,
          { headers: headers, responseType: 'text' }
        )
        .subscribe(
          (response: any) => {
            const imageUrl = `https://n8ke2vxks2.execute-api.us-east-1.amazonaws.com/media?bucketName=lng-courses&fileName=thumbnails/${file.name}`;
            this.insertImage(imageUrl);
            // const headers = new HttpHeaders().set('Accept', '*/*');
            // this.http
            //   .get(
            //     'https://tsw1pqoa9d.execute-api.us-east-1.amazonaws.com/Stage/media/download?bucketName=lng-courses&fileName=unnamed.jpg',
            //     {
            //       headers: headers,
            //       // observe: 'response',
            //       responseType: 'text',
            //     }
            //   )
            //   .subscribe(
            //     (res: any) => {
            //       const imgUrl = 'data:image/jpeg;base64,' + res;
            //       this.insertImage(imgUrl);
            //     },
            //     (error) => {
            //       console.error('Error downloading image:', error);
            //     }
            //   );
          },
          (error) => {
            console.error('Error uploading image:', error);
          }
        );
      // const url = URL.createObjectURL(file);
      // console.log({ url });
      // this.insertImage(url);
    }
  }
}
