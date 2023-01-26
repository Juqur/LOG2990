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

  soloClassList: string[] = ['button-81 solo selected'];
  oneVOneClassList: string[] = ['button-81 1v1'];

    ngOnInit(): void {
        this.populateSlides();
    }

    temp: string;
    slides: string[] = [];
    i = 0;

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
        <td width="70%">${this.level.playerSolo[0]}</td>
        <td width="30%">${this.level.timeSolo[0]}</td>
      </tr>
      <tr>
        <td width="70%">${this.level.playerSolo[1]}</td>
        <td width="30%">${this.level.timeSolo[1]}</td> 
      </tr>
      <tr>
        <td width="70%">${this.level.playerSolo[2]}</td>
        <td width="30%">${this.level.timeSolo[2]}</td>
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
        <td width="70%">${this.level.playerMulti[0]}</td>
        <td width="30%">${this.level.timeMulti[0]}</td>
      </tr>
      <tr>
        <td width="70%">${this.level.playerMulti[1]}</td>
        <td width="30%">${this.level.timeMulti[1]}</td>
      </tr>
      <tr>
        <td width="70%">${this.level.playerMulti[2]}</td>
        <td width="30%">${this.level.timeMulti[2]}</td>
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
