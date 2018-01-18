import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';

//import { LayerFactory } from './layer-factory.model';


@Component({
  selector: 'app-datasets',
  templateUrl: './datasets.component.html',
    styleUrls: ['./datasets.component.scss'],
    animations: [routerTransition()]
})

export class DatasetsComponent implements OnInit {

    //private datasetManager: LayerFactory;

    constructor() { }

    ngOnInit() {
    }

    addRecord() {
        // TODO: Check if layer exists

        // TODO: Turn our KnownLayer/CSWRecord into an actual Layer

        // TODO: If newLayer is undefined, it must have come from some other source like mastercatalogue

        //TODO: We may need to show a popup window with copyright info

        // TODO: Add layer to store

        // TODO: Ensure new layer is selected in layersPanel

    }

}
