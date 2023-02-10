import { Injectable } from '@angular/core';
import { DrawService } from './draw.service';

@Injectable({
  providedIn: 'root'
})
export class FlashDifferenceService extends DrawService{

  constructor() {
    super();
   }
}
