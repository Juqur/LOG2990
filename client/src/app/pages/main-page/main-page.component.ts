import { Component } from '@angular/core';
@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    icon: string = 'volume_up';
    volumeOnClick() {
        this.icon = this.icon === 'volume_up' ? 'volume_off' : 'volume_up';
    }
}
