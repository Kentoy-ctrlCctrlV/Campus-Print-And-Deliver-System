import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AdminService } from './admin';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthGuard implements CanActivate {
  constructor(private adminService: AdminService, private router: Router) {}

  canActivate(): boolean {
    if (this.adminService.getIsLoggedInValue()) {
      return true;
    }

    // Redirect to login if not authenticated
    this.router.navigate(['/']);
    return false;
  }
}
