import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgileService } from '../../core/services/agile.service';
import { ToastService } from '../../core/services/toast.service';
import { AgileRolesMap, SprintEpic, User, UserRole } from '../../core/models/agile.model';
import { IconComponent } from '../../shared/components/icons.component';
import { ModalComponent } from '../../shared/components/modal.component';

@Component({
  selector: 'app-agile-hub',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Operational Matrix & Team Governance
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-mono font-semibold">
              Matrix Directory
            </span>
          </h2>
          <p class="text-sm text-slate-500 mt-1">
            Traceability matrix mapping operational workflows, delivery sprints, and team role responsibilities.
          </p>
        </div>

        <div class="flex items-center gap-2">
          @if (activeTab() === 'users') {
            <button
              type="button"
              (click)="openUserModal()"
              class="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-95"
            >
              <app-icon name="plus" class="w-3.5 h-3.5"></app-icon>
              <span>Add Team Member</span>
            </button>
          }
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-2 border-b border-slate-200 pb-px">
        <button
          type="button"
          (click)="activeTab.set('matrix')"
          class="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2"
          [ngClass]="activeTab() === 'matrix' ? 'border-purple-600 text-purple-900 bg-purple-50/70' : 'border-transparent text-slate-500 hover:text-slate-900'"
        >
          <app-icon name="agile" class="w-4 h-4"></app-icon>
          <span>Capability Matrix ({{ sprints().length }})</span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('roles')"
          class="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2"
          [ngClass]="activeTab() === 'roles' ? 'border-purple-600 text-purple-900 bg-purple-50/70' : 'border-transparent text-slate-500 hover:text-slate-900'"
        >
          <app-icon name="shield-check" class="w-4 h-4"></app-icon>
          <span>Roles & Responsibilities</span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('users')"
          class="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2"
          [ngClass]="activeTab() === 'users' ? 'border-purple-600 text-purple-900 bg-purple-50/70' : 'border-transparent text-slate-500 hover:text-slate-900'"
        >
          <app-icon name="users" class="w-4 h-4"></app-icon>
          <span>Team Members ({{ users().length }})</span>
        </button>
      </div>

      <!-- TAB 1: EPICS & SPRINTS MATRIX -->
      @if (activeTab() === 'matrix') {
        <div class="space-y-4">
          <!-- Epic Filter Pills -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              (click)="selectedEpicNumber.set(null); loadSprints()"
              class="px-3.5 py-1.5 rounded-xl border transition-all font-medium"
              [ngClass]="selectedEpicNumber() === null ? 'bg-purple-600 border-purple-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
            >
              All Modules ({{ sprints().length }})
            </button>

            @for (num of [1, 2, 3, 4, 5, 6, 7, 8]; track num) {
              <button
                type="button"
                (click)="selectedEpicNumber.set(num); filterByEpic(num)"
                class="px-3 py-1.5 rounded-xl border transition-all font-medium whitespace-nowrap"
                [ngClass]="selectedEpicNumber() === num ? 'bg-purple-600 border-purple-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
              >
                Epic {{ num }}
              </button>
            }
          </div>

          <!-- Sprints Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (sprint of sprints(); track sprint.id) {
              <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-50 text-purple-700 border border-purple-200">
                      Epic {{ sprint.epicNumber }}
                    </span>
                    <span class="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-700">
                      <span>{{ sprint.storyPoints }} Pts</span>
                    </span>
                  </div>

                  <h5 class="text-xs text-slate-500 font-medium">{{ sprint.epicTitle }}</h5>
                  <h4 class="text-sm font-bold text-slate-900 mt-1 group-hover:text-purple-700 transition-colors">
                    {{ sprint.sprintName }}
                  </h4>

                  <p class="text-xs text-slate-600 mt-2.5 leading-relaxed">
                    {{ sprint.deliverablesSummary }}
                  </p>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-semibold border"
                    [ngClass]="getRoleBadgeClass(sprint.roleOwner)"
                  >
                    {{ formatRole(sprint.roleOwner) }}
                  </span>

                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {{ sprint.status }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 2: ROLES & RESPONSIBILITIES -->
      @if (activeTab() === 'roles') {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (roleKey of getRoleKeys(); track roleKey) {
            <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div class="flex items-center justify-between">
                <span class="font-mono text-xs text-purple-700 font-bold">{{ roleKey }}</span>
                <div class="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <app-icon name="shield-check" class="w-4 h-4"></app-icon>
                </div>
              </div>

              <div>
                <h3 class="text-base font-bold text-slate-900">{{ rolesMap()[roleKey].title }}</h3>
              </div>

              <div class="space-y-2 pt-2 border-t border-slate-100">
                <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Core Responsibilities:
                </span>
                <ul class="space-y-1.5 text-xs text-slate-600">
                  @for (resp of rolesMap()[roleKey].responsibilities; track resp) {
                    <li class="flex items-start gap-2">
                      <span class="text-purple-600 text-xs mt-0.5">&bull;</span>
                      <span>{{ resp }}</span>
                    </li>
                  }
                </ul>
              </div>
            </div>
          }
        </div>
      }

      <!-- TAB 3: TEAM USERS -->
      @if (activeTab() === 'users') {
        <div class="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
          <div class="p-4 bg-slate-50/75 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 class="text-sm font-semibold text-slate-900">Agile Project & Retail Operations Personnel</h3>
              <p class="text-xs text-slate-500">Team members mapped to retail and Scrum sprint roles.</p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 uppercase tracking-wider border-b border-slate-200 font-semibold">
                <tr>
                  <th class="py-3 px-4">Username</th>
                  <th class="py-3 px-4">Full Name</th>
                  <th class="py-3 px-4">Email</th>
                  <th class="py-3 px-4">Assigned Role</th>
                  <th class="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-600">
                @for (u of users(); track u.id) {
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-3 px-4 font-mono font-bold text-indigo-600">{{ u.username }}</td>
                    <td class="py-3 px-4 font-semibold text-slate-900">{{ u.fullName }}</td>
                    <td class="py-3 px-4 text-slate-600">{{ u.email }}</td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold border" [ngClass]="getRoleBadgeClass(u.role)">
                        {{ formatRole(u.role) }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- MODAL: ADD USER -->
      <app-modal
        [isOpen]="isUserModalOpen()"
        title="Add Agile Team Member"
        icon="users"
        (close)="isUserModalOpen.set(false)"
      >
        <form (ngSubmit)="saveUser()" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Username *</label>
              <input
                type="text"
                [(ngModel)]="userForm.username"
                name="uUsername"
                required
                placeholder="e.g. josh.inv"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Full Name *</label>
              <input
                type="text"
                [(ngModel)]="userForm.fullName"
                name="uFullName"
                required
                placeholder="e.g. Josh Martinez"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Email *</label>
              <input
                type="email"
                [(ngModel)]="userForm.email"
                name="uEmail"
                required
                placeholder="josh@stocksphere.com"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Operational Role *</label>
              <select
                [(ngModel)]="userForm.role"
                name="uRole"
                required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
              >
                <option value="PRODUCT_OWNER">Product Owner</option>
                <option value="SCRUM_MASTER">Scrum Master</option>
                <option value="INVENTORY_MANAGER">Inventory Manager</option>
                <option value="WAREHOUSE_STAFF">Warehouse Operations Staff</option>
                <option value="PURCHASING_OFFICER">Purchasing Officer</option>
                <option value="SALES_AGENT">Sales Agent</option>
              </select>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              (click)="isUserModalOpen.set(false)"
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
            >
              Create Member
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `
})
export class AgileHubComponent implements OnInit {
  private readonly agileService = inject(AgileService);
  private readonly toast = inject(ToastService);

  readonly activeTab = signal<'matrix' | 'roles' | 'users'>('matrix');
  readonly sprints = signal<SprintEpic[]>([]);
  readonly rolesMap = signal<AgileRolesMap>({});
  readonly users = signal<User[]>([]);

  readonly selectedEpicNumber = signal<number | null>(null);
  readonly isUserModalOpen = signal(false);

  userForm: Partial<User> = {
    username: '',
    fullName: '',
    email: '',
    role: 'INVENTORY_MANAGER',
    active: true
  };

  ngOnInit(): void {
    this.loadSprints();
    this.loadRoles();
    this.loadUsers();
  }

  loadSprints(): void {
    this.agileService.getAllSprintsAndEpics().subscribe({
      next: (data) => this.sprints.set(data),
      error: () => this.toast.error('Error', 'Failed to load sprints matrix.')
    });
  }

  filterByEpic(epicNumber: number): void {
    this.agileService.getSprintsByEpic(epicNumber).subscribe({
      next: (data) => this.sprints.set(data),
      error: () => {}
    });
  }

  loadRoles(): void {
    this.agileService.getAgileRoles().subscribe({
      next: (roles) => this.rolesMap.set(roles),
      error: () => {}
    });
  }

  loadUsers(): void {
    this.agileService.getAllUsers().subscribe({
      next: (users) => this.users.set(users),
      error: () => {}
    });
  }

  getRoleKeys(): string[] {
    return Object.keys(this.rolesMap());
  }

  formatRole(role: UserRole): string {
    return role ? role.replace(/_/g, ' ') : '';
  }

  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case 'PRODUCT_OWNER': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SCRUM_MASTER': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'INVENTORY_MANAGER': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'WAREHOUSE_STAFF': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PURCHASING_OFFICER': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'SALES_AGENT': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  openUserModal(): void {
    this.userForm = {
      username: '',
      fullName: '',
      email: '',
      role: 'INVENTORY_MANAGER',
      active: true
    };
    this.isUserModalOpen.set(true);
  }

  saveUser(): void {
    this.agileService.createUser(this.userForm).subscribe({
      next: (user) => {
        this.toast.success('Member Added', `User ${user.username} created.`);
        this.isUserModalOpen.set(false);
        this.loadUsers();
      },
      error: (err) => this.toast.error('Error', err?.error?.message || 'Failed to create user.')
    });
  }
}

