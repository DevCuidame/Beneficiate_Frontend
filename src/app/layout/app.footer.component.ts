import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from "./service/app.layout.service";

@Component({
    selector: 'app-footer',
    templateUrl: './app.footer.component.html',
    standalone: true,
    imports: [
        CommonModule
    ]
})
export class AppFooterComponent {
    constructor(public layoutService: LayoutService) { }
}