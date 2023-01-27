import { Component, OnInit, Input } from '@angular/core';
import { Level } from '@app/levels';

@Component({
    selector: 'app-carousel',
    templateUrl: './carousel.component.html',
    styleUrls: ['./carousel.component.scss'],
})

export class CarouselComponent implements OnInit {
  @Input() level: Level;
  @Input() index: number;

  // soloClassList: string[] = ['button-81 solo selected'];
  // oneVOneClassList: string[] = ['button-81 1v1'];

    ngOnInit(): void {
        this.populateSlides();
    }

    temp: string;
    slides: string[] = [];
    i = 0;

    getSafe(fn:any, defaultVal:any) {
      try {
        return fn();
      } catch (e) {
        return defaultVal;
      }
    }

    getTimeSolo(index: number) {
      try{
        return this.level.timeSolo[index];
      }
      catch{
        return "No time";
      }
    }

    getTimeMulti(index: number) {
      try{
        return this.level.timeMulti[index];
      }
      catch{
        return "No time";
      }
    }

    getPlayerSolo(index: number) {
      try{
        return this.level.playerSolo[index];
      }
      catch{
        return "No player";
      }
    }

    getPlayerMulti(index: number) {
      try{
        return this.level.playerMulti[index];
      }
      catch{
        return "No player";
      }
    }

    populateSlides() {
        this.temp = `
    <table width="100%">
    <thead>
      <tr>
        <td><b>SOLO</b></th>
        <td><b>Time (s)</b></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td width="70%">${this.getPlayerSolo(0)}</td>
        <td width="30%">${this.getTimeSolo(0)}</td>
      </tr>
      <tr>
      <td width="70%">${this.getPlayerSolo(1)}</td>
      <td width="30%">${this.getTimeSolo(1)}</td>
      </tr>
      <tr>
      <td width="70%">${this.getPlayerSolo(2)}</td>
      <td width="30%">${this.getTimeSolo(2)}</td>
      </tr>
    </tbody>
    </table>`;

        this.slides.push(this.temp);

        this.temp = `
    <table width="100%">
    <thead>
      <tr>
      <td><b>1v1</b></th>
      <td><b>Time (s)</b></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td width="70%">${this.getPlayerMulti(0)}</td>
        <td width="30%">${this.getTimeMulti(0)}</td>
      </tr>
      <tr>
      <td width="70%">${this.getPlayerMulti(1)}</td>
      <td width="30%">${this.getTimeMulti(1)}</td>
      </tr>
      <tr>
      <td width="70%">${this.getPlayerMulti(2)}</td>
      <td width="30%">${this.getTimeMulti(2)}</td>
      </tr>
    </tbody>
    </table>`;

        this.slides.push(this.temp);
    

  }

  getSlide() {
      return this.slides[this.i];
  }

  getSolo(index: number) {
      this.i = this.i===0 ? 0 : this.i - 1;
      document.getElementsByClassName(index.toString())[0].classList.add("selected");
      document.getElementsByClassName((index+1).toString())[0].classList.remove("selected");
  }
//edit here    
  getOneVOne(index: number) {
      this.i = this.i===this.slides.length-1 ? this.i : this.i + 1;
      document.getElementsByClassName(index.toString())[0].classList.add("selected");
      document.getElementsByClassName((index-1).toString())[0].classList.remove("selected");
  }

  getPrev() {
      this.i = this.i === 0 ? 0 : this.i - 1;
  }
  
  getNext() {
      this.i = this.i === this.slides.length - 1 ? this.i : this.i + 1;
  }

  // function getSlide() {
  //   throw new Error('Function not implemented.');
  // }

}
