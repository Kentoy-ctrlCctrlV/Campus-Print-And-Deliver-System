import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface AdminCredentials {
  username: string;
  password: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin';
  loggedInAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private currentAdmin$ = new BehaviorSubject<AdminUser | null>(null);
  private isLoggedIn$ = new BehaviorSubject<boolean>(false);

  // In a real application, this would be a backend call
  // For demo purposes, we'll have a hardcoded admin account
  private validCredentials = {
    username: 'admin',
    password: 'admin123',
  };

  constructor() {
    this.checkStoredSession();
  }

  getCurrentAdmin(): Observable<AdminUser | null> {
    return this.currentAdmin$.asObservable();
  }

  isLoggedIn(): Observable<boolean> {
    return this.isLoggedIn$.asObservable();
  }

  getIsLoggedInValue(): boolean {
    return this.isLoggedIn$.value;
  }

  login(credentials: AdminCredentials): Observable<AdminUser | null> {
    // Simulate API call with delay
    return of(this.validateCredentials(credentials)).pipe(delay(500));
  }

  logout(): void {
    this.currentAdmin$.next(null);
    this.isLoggedIn$.next(false);
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminSession');
  }

  private validateCredentials(credentials: AdminCredentials): AdminUser | null {
    if (
      credentials.username === this.validCredentials.username &&
      credentials.password === this.validCredentials.password
    ) {
      const adminUser: AdminUser = {
        id: 'admin-001',
        username: credentials.username,
        email: 'admin@campusprintdeliver.edu',
        role: 'admin',
        loggedInAt: new Date().toISOString(),
      };

      // Store in localStorage
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
      localStorage.setItem('adminSession', 'active');

      this.currentAdmin$.next(adminUser);
      this.isLoggedIn$.next(true);

      return adminUser;
    }

    return null;
  }

  private checkStoredSession(): void {
    const storedAdmin = localStorage.getItem('adminUser');
    const session = localStorage.getItem('adminSession');

    if (storedAdmin && session === 'active') {
      try {
        const admin = JSON.parse(storedAdmin) as AdminUser;
        this.currentAdmin$.next(admin);
        this.isLoggedIn$.next(true);
      } catch (error) {
        console.error('Failed to restore admin session:', error);
        this.logout();
      }
    }
  }
}
