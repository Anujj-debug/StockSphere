import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './layout/sidebar.component';
import { HeaderComponent } from './layout/header.component';
import { ToastComponent } from './shared/components/toast.component';
import { DashboardService } from './core/services/dashboard.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly lowStockCount = signal(0);
  readonly inTransitCount = signal(0);
  readonly pendingOrdersCount = signal(0);

  ngOnInit(): void {
    this.refreshMetrics();
  }

  refreshMetrics(): void {
    this.dashboardService.getSummary().subscribe({
      next: (summary) => {
        this.lowStockCount.set(summary.lowStockCount || 0);
        this.inTransitCount.set(summary.inTransitTransfersCount || 0);
        this.pendingOrdersCount.set(summary.pendingSalesOrdersCount || 0);
      },
      error: () => {}
    });
  }
}
