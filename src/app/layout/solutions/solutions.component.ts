import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';

@Component({
  selector: 'app-solutions',
  templateUrl: './solutions.component.html',
  styleUrls: ['./solutions.component.scss'],
  animations: [routerTransition()]
})
export class SolutionsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
