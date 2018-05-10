import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DownloadOptions } from '../../shared/modules/vgl/models';


@Component({
    selector: 'download-options-modal-content',
    templateUrl: './download-options.modal.component.html',
    styleUrls: ['./download-options.modal.component.scss']
})


export class DownloadOptionsModalContent implements OnInit {

    // TODO: We may want to move these if needed by other classes
    LATITUDE_PATTERN = '^(\\+|-)?(?:90(?:(?:\\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\\.[0-9]{1,6})?))$';
    LONGITUDE_PATTERN = '^(\\+|-)?(?:180(?:(?:\\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\\.[0-9]{1,6})?))$';

    @Input() public downloadOptions: DownloadOptions;
    @Input() public onlineResource: any;

    downloadOptionsForm: FormGroup;

    dataTypes: any[] = [];


    constructor(private formBuilder: FormBuilder, public activeModal: NgbActiveModal) { }


    ngOnInit() {
        if(this.onlineResource.type==='WFS' || this.onlineResource.type==='WCS') {
            this.populateDataTypes(this.onlineResource.type);
        }
        this.createForm();
    }


    /**
     * Reriev the output formats for WFS online resource type.
     * 
     * TODO: Implement and enable for WFS, also in template
     */
    getFeatureRequestOutputFormats(): any[] {
        /*
        {
            type : 'ajax',
            url : 'getFeatureRequestOutputFormats.do',
            extraParams : {
                serviceUrl : config.serviceUrl
            },
            reader : {
                type : 'json',
                rootProperty : 'data'
            }
        }
        */
       return [];
    }


    /**
     * 
     * @param type the type of the online resource, will be 'WCS' or 'WFS'
     */
    private populateDataTypes(type: string) {
        if(type==='WFS') {
            this.dataTypes = this.getFeatureRequestOutputFormats();
        } else if(type==='WCS') {
            this.dataTypes = [
                { label : 'CSV', urn : 'csv' },
                { label : 'GeoTIFF', urn : 'geotif' },
                { label : 'NetCDF', urn : 'nc' }
            ];
        }

    }


    /**
     * Construct the DL options FormGroup based on the supplied DownloadOptions input
     */
    private createForm(): void {
        let optionsGroup = {};
        for(let option in this.downloadOptions) {
            switch(option) {
                // TODO: Proper validator patterns
                case "format": {
                    optionsGroup['format'] = [this.downloadOptions.format, Validators.required];
                    break;
                }
                case "northBoundLatitude": {
                    optionsGroup['northBoundLatitude'] = [
                        this.downloadOptions.northBoundLatitude, [
                            Validators.required,
                            Validators.pattern(this.LATITUDE_PATTERN)
                        ]
                    ];
                    break;
                }
                case "eastBoundLongitude": {
                    optionsGroup['eastBoundLongitude'] = [
                        this.downloadOptions.eastBoundLongitude, [
                            Validators.required,
                            Validators.pattern(this.LONGITUDE_PATTERN)
                        ]
                    ];
                    break;
                }
                case "southBoundLatitude": {
                    optionsGroup['southBoundLatitude'] = [
                        this.downloadOptions.southBoundLatitude, [
                            Validators.required,
                            Validators.pattern(this.LATITUDE_PATTERN)
                        ]
                    ];
                    break;
                }
                case "westBoundLongitude": {
                    optionsGroup['westBoundLongitude'] = [
                        this.downloadOptions.westBoundLongitude, [
                            Validators.required,
                            Validators.pattern(this.LONGITUDE_PATTERN)
                        ]
                    ];
                    break;
                }
                case "srsName": {
                    optionsGroup['srsName'] = [this.downloadOptions.srsName, Validators.required];
                    break;
                }
                case "localPath": {
                    optionsGroup['localPath'] = [this.downloadOptions.localPath, Validators.required];
                    break;
                }
                case "name": {
                    optionsGroup['name'] = [this.downloadOptions.name, Validators.required];
                    break;
                }
                case "description": {
                    optionsGroup['description'] = [this.downloadOptions.description, Validators.required];
                    break;
                }
            }
        }
        this.downloadOptionsForm = this.formBuilder.group(optionsGroup);
    }


    /**
     * Revert any form input changes back to their original state
     */
    public revertChanges() {
        this.createForm();
    }


    /**
     * Save the changes to the DL options and close the dialog
     */
    public saveChanges() {
        if(this.downloadOptionsForm.valid) {
            for(let option in this.downloadOptions) {
                // Not all DL options are editable and hence won't be on form (e.g. URL)
                if(this.downloadOptionsForm.controls.hasOwnProperty(option)) {
                    this.downloadOptions[option] = this.downloadOptionsForm.controls[option].value;
                }
            }
            this.activeModal.close();
        } else {

        }
    }
    
}
