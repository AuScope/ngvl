import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../router.animations';

@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.scss'],
  animations: [routerTransition()]  
})
export class LandingpageComponent implements OnInit {

  constructor() {     
   }

  ngOnInit() {  
  } 

}
