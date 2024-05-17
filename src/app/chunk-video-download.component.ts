import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-chunk-video-download',
  templateUrl: './chunk-video-download.component.html',
  styleUrls: ['./chunk-video-download.component.css'],
})
export class ChunkVideoDownloadComponent {
  videoChunks: Blob[] = [];
  totalChunks = 6; // Adjust based on the total number of chunks
  chunkSize = 4194304; // Adjust based on maximum size of each chunks
  fileName = 'SampleVideo_1280x720_20mb.mp4'; // Adjust based on the video file name

  constructor(private http: HttpClient) {}

  downloadChunks() {
    this.videoChunks = []; // Clear existing chunks
    const downloadPromises = [];
    for (let i = 1; i <= this.totalChunks; i++) {
      downloadPromises.push(this.downloadChunk(i));
    }

    Promise.all(downloadPromises)
      .then((chunks) => {
        this.videoChunks = chunks;
        this.combineChunksAndPlay();
      })
      .catch((error) => {
        console.error('Error downloading chunks:', error);
      });
  }

  private downloadChunk(chunkNumber: number): Promise<Blob> {
    const downloadUrl = `https://tsw1pqoa9d.execute-api.us-east-1.amazonaws.com/Stage/media?bucketName=lng-courses&fileName=${this.fileName}`;
    const options = {
      headers: new HttpHeaders()
        .append('Accept', 'video/mp4')
        .append('CHUNK', chunkNumber.toString())
        .append('CHUNK-SIZE', this.chunkSize.toString()),
      responseType: 'blob' as 'json', // Ensure responseType is set to blob
    };
    return this.http.get(downloadUrl, options).toPromise() as Promise<Blob>;
  }

  private combineChunksAndPlay() {
    const combinedBlob = new Blob(this.videoChunks);
    const videoUrl = window.URL.createObjectURL(combinedBlob);

    // Optionally, you can create a video element and set its source to play the video
    const video = document.createElement('video');
    video.controls = true; // Show video controls
    video.src = videoUrl;
    video.style.width = '100%'; // Adjust video styles as needed
    document.body.appendChild(video);

    // Alternatively, you can directly set the window location to trigger download
    // window.location.href = videoUrl;
  }
}
