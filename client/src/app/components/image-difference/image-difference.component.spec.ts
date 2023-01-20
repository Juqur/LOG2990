import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageDifferenceComponent } from './image-difference.component';

describe('ImageDifferenceComponent', () => {
  let component: ImageDifferenceComponent;
  let fixture: ComponentFixture<ImageDifferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageDifferenceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageDifferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
