import { Component, Input } from '@angular/core';
import { Level } from '@app/levels';


// import { CarouselComponent } from '../carousel/carousel.component';
@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
})
export class CardComponent {
    @Input() level: Level;
    
    difficulty:string;

    displayDifficulty(): string {
        if(this.level.isEasy == true) {
            return "Easy";
        }
        else {
            return "Hard";
        }
    }

    ngOnInit(): void {
        this.difficulty = this.displayDifficulty();
    }
}
