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

  private validCredentials = [
    { username: 'kentzayas@admin', password: 'kentadmin69420' },
    { username: 'mydensaga@admin', password: 'mydenadmin12345' },
    { username: 'vincentperez@admin', password: 'vincentadmin6767' },
    { username: 'joshgalagnao@admin', password: 'joshadmin6969' },
  ];

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
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminSession');
    }
  }

  private validateCredentials(credentials: AdminCredentials): AdminUser | null {
    const validAdmin = this.validCredentials.find(
      (admin) =>
        admin.username === credentials.username &&
        admin.password === credentials.password
    );

    if (!validAdmin) {
      return null;
    }

    const adminUser: AdminUser = {
      id: `admin-${credentials.username.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}`,
      username: credentials.username,
      email: credentials.username,
      role: 'admin',
      loggedInAt: new Date().toISOString(),
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
      localStorage.setItem('adminSession', 'active');
    }

    this.currentAdmin$.next(adminUser);
    this.isLoggedIn$.next(true);

    return adminUser;
  }

  private checkStoredSession(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

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
