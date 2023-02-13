import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CarouselComponent } from '@app/components/carousel/carousel.component';
import { PopUpServiceService } from '@app/services/pop-up-service.service';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
    let component: CardComponent;
    let fixture: ComponentFixture<CardComponent>;
    let router: Router;
    let popUpService: PopUpServiceService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CardComponent, CarouselComponent],
            imports: [MatDialogModule, RouterTestingModule],
        }).compileComponents();

        fixture = TestBed.createComponent(CardComponent);
        popUpService = TestBed.inject(PopUpServiceService);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the easy difficulty icon', () => {
        component.level.isEasy = true;
        expect(component.displayDifficultyIcon(component.level.isEasy)).toEqual('../../../assets/images/easy.png');
    });

    it('should display the hard difficulty icon', () => {
        component.level.isEasy = false;
        expect(component.displayDifficultyIcon(component.level.isEasy)).toEqual('../../../assets/images/hard.png');
    });

    it('should display the easy difficulty', () => {
        component.level.isEasy = true;
        expect(component.displayDifficulty()).toEqual('Easy');
    });

    it('should display the hard difficulty', () => {
        component.level.isEasy = false;
        expect(component.displayDifficulty()).toEqual('Hard');
    });

    it('should navigate to the game page when playSolo is called', () => {
        component.playSolo();
        spyOn(popUpService, 'openDialog');
        expect(router.navigate).toHaveBeenCalledWith([`/game/${component.level.id}/`], {
            queryParams: { playerName: component.playerName },
        });
    });
});
