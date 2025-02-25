import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HeaderDashComponent } from '../header-dash/header-dash.component';
import { SidebarDashComponent } from '../sidebar-dash/sidebar-dash.component';
import { ChatFloatingComponent } from 'src/app/shared/components/call-center/chat-floating/chat-floating.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-containter-dash',
  imports: [CommonModule, RouterModule, HeaderDashComponent, SidebarDashComponent, ChatFloatingComponent],
  templateUrl: './containter-dash.component.html',
  styleUrls: ['./containter-dash.component.scss'],
})
export class ContainterDashComponent  implements OnInit {
  public isVisible: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
    this.router.events
          .pipe(filter(event => event instanceof NavigationEnd))
          .subscribe((event: NavigationEnd) => {
            const url = event.url;
            if (url.includes('/daily')) {
              this.isVisible = true;
            } else if (url.includes('/pending')) {
              this.isVisible = false;
            } else if (url.includes('/assigment')) {
              this.isVisible = true;
            }
          });
  }

}
