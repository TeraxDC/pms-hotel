import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DialogContainerComponent } from './shared/components/dialog/dialog.component';
import { ToastContainerComponent } from './shared/components/toast/toast.component';
import { FaviconService } from './core/services/favicon.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DialogContainerComponent, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private favicon = inject(FaviconService);

  ngOnInit() {
    this.favicon.init();
  }
}
