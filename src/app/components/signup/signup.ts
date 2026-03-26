import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class SignupComponent {
  studentName = '';
  studentEmailOrPhone = '';

  constructor(private router: Router) {}

  onSubmit() {
    if (!this.studentName.trim() || !this.studentEmailOrPhone.trim()) {
      alert('Please provide both name and email/phone');
      return;
    }

    localStorage.setItem('studentName', this.studentName.trim());
    localStorage.setItem('studentEmailOrPhone', this.studentEmailOrPhone.trim());

    this.router.navigate(['/dashboard']);
  }
}

