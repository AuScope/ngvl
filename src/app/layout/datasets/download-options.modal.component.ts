import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DownloadOptions } from '../../shared/modules/vgl/models';
import { VglService } from '../../shared/modules/vgl/vgl.service';


@Component({
    selector: 'download-options-modal-content',
    templateUrl: './download-options.modal.component.html',
    styleUrls: ['./download-options.modal.component.scss']
})


export class DownloadOptionsModalContent implements OnInit {

    // Validator patterns
    LATITUDE_PATTERN = '^(\\+|-)?(?:90(?:(?:\\.0{1,20})?)|(?:[0-9]|[1-8][0-9])(?:(?:\\.[0-9]{1,20})?))$';
    LONGITUDE_PATTERN = '^(\\+|-)?(?:180(?:(?:\\.0{1,20})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\\.[0-9]{1,20})?))$';

    @Input() public downloadOptions: DownloadOptions;
    @Input() public onlineResource: any;

    downloadOptionsForm: FormGroup;

    dataTypes: any[] = [];


    constructor(private formBuilder: FormBuilder, public activeModal: NgbActiveModal, private vglService: VglService) { }


    ngOnInit() {
        if(this.onlineResource.type==='WFS' || this.onlineResource.type==='WCS') {
            this.populateDataTypes();
        }
        this.createForm();
    }


    /**
     * Retrieve the output formats for WFS online resource type.
     * 
     * TODO: Find a working WFS example to test this against
     */
    getFeatureRequestOutputFormats(serviceUrl: string): any[] {
        let outputFormats: any[] = [];
        this.vglService.getRequestedOutputFormats(serviceUrl).subscribe(
            response => { 
                outputFormats = response;
            }
        )
        return outputFormats;
    }


    /**
     * 
     * @param type the type of the online resource, will be 'WCS' or 'WFS'
     */
    private populateDataTypes() {
        if(this.onlineResource.type==='WFS') {
            this.dataTypes = this.getFeatureRequestOutputFormats(this.onlineResource.serviceUrl);
        } else if(this.onlineResource.type==='WCS') {
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
                case "url": {
                    optionsGroup['url'] = [this.downloadOptions.url, Validators.required];
                    break;
                }
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
        }
    }
    
}
