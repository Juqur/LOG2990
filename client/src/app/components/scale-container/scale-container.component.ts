import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'app-scale-container',
    templateUrl: './scale-container.component.html',
    styleUrls: ['./scale-container.component.scss'],
})
export class ScaleContainerComponent implements OnInit {
    @ViewChild('screen', { static: true }) screen: ElementRef;
    @ViewChild('container', { static: true }) container: ElementRef;
    scale: number = 1;

    ngOnInit(): void {
        this.resizeContainer();
    }

    /**
     * Resizes the container and its components to fit the screen.
     */
    resizeContainer() {
        const screenWidth = this.screen.nativeElement.offsetWidth;
        const screenHeight = this.screen.nativeElement.offsetHeight;
        const containerWidth = this.container.nativeElement.offsetWidth;
        const containerHeight = this.container.nativeElement.offsetHeight;
        this.scale = Math.min(screenWidth / containerWidth, screenHeight / containerHeight);
    }
}
