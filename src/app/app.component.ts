import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html'
})
export class AppComponent {
  // Since the image is in the public folder, we just reference the filename
  gcashQrPath: string = 'kzgcashqr.jpg';
}