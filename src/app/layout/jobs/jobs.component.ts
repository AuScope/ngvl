import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
  animations: [routerTransition()]
})
export class JobsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
