import { Component } from '@angular/core';

@Component({
    selector: 'app-test-diff',
    templateUrl: './test-diff.component.html',
    styleUrls: ['./test-diff.component.scss'],
})
export class TestDiffComponent {
    defaultImage: File | null = null;
    diffImage: File | null = null;
    radius = 3;

    defaultImageSelector(event: Event) {
        const target = event.target as HTMLInputElement;
        if (!target.files) {
            return;
        }
        this.defaultImage = target.files[0];
    }
    diffImageSelector(event: Event) {
        const target = event.target as HTMLInputElement;
        if (!target.files) {
            return;
        }
        this.diffImage = target.files[0];
    }
}
