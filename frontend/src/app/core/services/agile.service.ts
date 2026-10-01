import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AgileRolesMap, SprintEpic, User, UserRole } from '../models/agile.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AgileService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);

  getAllSprintsAndEpics(): Observable<SprintEpic[]> {
    return this.http.get<SprintEpic[]>(this.api.url('/agile/sprints-epics'));
  }

  getSprintsByEpic(epicNumber: number): Observable<SprintEpic[]> {
    return this.http.get<SprintEpic[]>(this.api.url(`/agile/sprints-epics/epic/${epicNumber}`));
  }

  getAgileRoles(): Observable<AgileRolesMap> {
    return this.http.get<AgileRolesMap>(this.api.url('/agile/roles'));
  }

  // Users
  getAllUsers(role?: UserRole): Observable<User[]> {
    let params = new HttpParams();
    if (role) params = params.set('role', role);
    return this.http.get<User[]>(this.api.url('/users'), { params });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(this.api.url(`/users/${id}`));
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.api.url('/users'), user);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(this.api.url(`/users/${id}`), user);
  }
}
