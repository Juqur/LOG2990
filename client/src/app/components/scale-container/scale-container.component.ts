import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'app-scale-container',
    templateUrl: './scale-container.component.html',
    styleUrls: ['./scale-container.component.scss'],
})
/**
 * This component is a wrapper to pose on the pages to format the display of elements in a uniform manner.
 *
 * @author Pierre Tran
 * @class ScaleContainerComponent
 */
export class ScaleContainerComponent implements OnInit {
    @ViewChild('screen', { static: true }) private screen: ElementRef;
    @ViewChild('container', { static: true }) private container: ElementRef;
    @Input() isScalable: boolean = false;
    private scaleRatio: number = 1;

    /**
     * Getter for the scaleRatio attribute.
     */
    get scale(): number {
        return this.scaleRatio;
    }

    /**
     * This code triggers on the initial rendering of the component and resizes the children components
     * to a uniform format.
     */
    ngOnInit(): void {
        this.resizeContainer();
    }

    /**
     * This method is used to resize the container to a uniform format and avoid the use of complex
     * and intricate CSS rules to format every page. It essentially makes it so every page follows
     * a similar size.
     */
    resizeContainer(): void {
        const screenWidth = this.screen.nativeElement.offsetWidth;
        const screenHeight = this.screen.nativeElement.offsetHeight;
        const containerWidth = this.container.nativeElement.offsetWidth;
        const containerHeight = this.container.nativeElement.offsetHeight;
        this.scaleRatio = Math.min(screenWidth / containerWidth, screenHeight / containerHeight);
    }
}
