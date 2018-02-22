import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';


@Component({
  selector: 'app-datasets',
  templateUrl: './datasets.component.html',
    styleUrls: ['./datasets.component.scss'],
    animations: [routerTransition()]
})
export class DatasetsComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
