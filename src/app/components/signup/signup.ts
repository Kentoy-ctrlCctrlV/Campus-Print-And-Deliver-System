import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class SignupComponent {
  // Student login form
  studentName = '';
  studentEmailOrPhone = '';

  // Admin login form
  isAdminMode = false;
  adminForm: FormGroup;
  adminLoginError = '';
  isAdminLoading = false;

  constructor(
    private router: Router,
    private adminService: AdminService,
    private fb: FormBuilder
  ) {
    this.adminForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Toggle between student and admin login
  toggleAdminMode() {
    this.isAdminMode = !this.isAdminMode;
    this.adminLoginError = '';
    this.adminForm.reset();
  }

  // Student login handler
  onSubmit() {
    if (!this.studentName.trim() || !this.studentEmailOrPhone.trim()) {
      alert('Please provide both name and email/phone');
      return;
    }

    localStorage.setItem('studentName', this.studentName.trim());
    localStorage.setItem('studentEmailOrPhone', this.studentEmailOrPhone.trim());

    this.router.navigate(['/dashboard']);
  }

  // Admin login handler
  onAdminLogin() {
    if (this.adminForm.invalid) {
      alert('Please fill in all required fields');
      return;
    }

    this.isAdminLoading = true;
    this.adminLoginError = '';

    const credentials = {
      username: this.adminForm.value.username,
      password: this.adminForm.value.password,
    };

    this.adminService.login(credentials).subscribe(
      (result) => {
        this.isAdminLoading = false;

        if (result) {
          // Successful login
          this.adminForm.reset();
          this.router.navigate(['/admin-dashboard']);
        } else {
          // Failed login
          this.adminLoginError = 'Invalid username or password';
        }
      },
      (error) => {
        this.isAdminLoading = false;
        this.adminLoginError = 'An error occurred during login. Please try again.';
        console.error('Admin login error:', error);
      }
    );
  }
}

