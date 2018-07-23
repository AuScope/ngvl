import { Component, Input, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserStateService } from '../../shared';
import { DownloadOptions, BookMark } from '../../shared/modules/vgl/models';
import { VglService } from '../../shared/modules/vgl/vgl.service';
import { CSWSearchService } from '../../shared/services/csw-search.service';
import { Dropdown } from "primeng/components/dropdown/dropdown";
import { SelectItem } from 'primeng/api';
import { ButtonsComponent } from '../bs-component/components';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'download-options-modal-content',
    templateUrl: './download-options.modal.component.html',
    styleUrls: ['./download-options.modal.component.scss']
})


export class DownloadOptionsModalContent implements OnInit {

    // Validator patterns
    LATITUDE_PATTERN = '^(\\+|-)?(?:90(?:(?:\\.0{1,20})?)|(?:[0-9]|[1-8][0-9])(?:(?:\\.[0-9]{1,20})?))$';
    LONGITUDE_PATTERN = '^(\\+|-)?(?:180(?:(?:\\.0{1,20})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\\.[0-9]{1,20})?))$';

    @Input() public downloadOptions: DownloadOptions;
    @Input() public bookmarkOptions: DownloadOptions[];
    @Input() public defaultDownloadOptions: DownloadOptions;
    @Input() public onlineResource: any;
    @Input() isBMarked: boolean;
    @Input() cswRecord: CSWRecordModel;
    downloadOptionsForm: FormGroup;
    dataTypes: any[] = [];
    @Input() dropDownItems: SelectItem[] = [];
    selectedOptions: DownloadOptions;

    @ViewChild('dropDown') private dropDown: Dropdown;
    @ViewChild('addButton') private addButton: ElementRef;
    @ViewChild('deleteButton') private deleteButton: ElementRef;


    constructor(private formBuilder: FormBuilder,
        public activeModal: NgbActiveModal,
        private vglService: VglService,
        private userStateService: UserStateService,
        private cswSearchService: CSWSearchService) {
    }


    ngOnInit() {
        if (this.onlineResource.type === 'WFS' || this.onlineResource.type === 'WCS') {
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
        if (this.onlineResource.type === 'WFS') {
            this.dataTypes = this.getFeatureRequestOutputFormats(this.onlineResource.serviceUrl);
        } else if (this.onlineResource.type === 'WCS') {
            this.dataTypes = [
                { label: 'CSV', urn: 'csv' },
                { label: 'GeoTIFF', urn: 'geotif' },
                { label: 'NetCDF', urn: 'nc' }
            ];
        }

    }
    /**
     * Construct the DL options FormGroup based on the supplied DownloadOptions input
     */
    private createForm(): void {
        let optionsGroup = {};
        for (let option in this.downloadOptions) {
            switch (option) {
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
    public revertChanges(): void {
        this.downloadOptionsForm.reset(this.defaultDownloadOptions, { onlySelf: true, emitEvent: true });
    }


    /**
     * Save the changes to the DL options and close the dialog
     */
    public saveChanges() {
        if (this.downloadOptionsForm.valid) {
            for (let option in this.downloadOptions) {
                // Not all DL options are editable and hence won't be on form (e.g. URL)
                if (this.downloadOptionsForm.controls.hasOwnProperty(option)) {
                    this.downloadOptions[option] = this.downloadOptionsForm.controls[option].value;
                }
            }
            this.activeModal.close();
        }
    }

    /**
     * 
     */
    public selectSaveOptions() {
        if (this.selectedOptions && this.selectedOptions.bookmarkOptionName)
            this.downloadOptionsForm.reset(this.selectedOptions, { onlySelf: true, emitEvent: true });
        if (this.selectedOptions && this.selectedOptions.bookmarkOptionName && (this.selectedOptions.bookmarkOptionName.indexOf('Default Options') >= 0)) {
            this.deleteButton.nativeElement.disabled = true;
            this.addButton.nativeElement.disabled = true;
        }
        if (this.selectedOptions && !this.selectedOptions.bookmarkOptionName) {
            this.deleteButton.nativeElement.disabled = false;
            this.addButton.nativeElement.disabled = false;
        }

    }

    /**
     * 
     */
    public addSavedOptions() {
        let savedOptionsName: any = this.selectedOptions;
        this.downloadOptions.bookmarkOptionName = savedOptionsName;
        this.dropDownItems.push({ label: savedOptionsName, value: this.downloadOptions });
        //this.vglService.updateDownloadOptions(this.downloadOptions);        
    }

    /**
     * 
     */
    public deleteSavedOptions() {
        console.log("deleted  option" + this.selectedOptions);
        console.log(JSON.stringify(this.selectedOptions));
        if (this.selectedOptions.bookmarkOptionName.indexOf('Default Options') === -1) {
            let index = this.dropDownItems.findIndex(item => {
                return (item.value.bookmarkOptionName.indexOf(this.selectedOptions.bookmarkOptionName) >= 0);
            });
            if (index > -1)
                this.dropDownItems.splice(index, 1);

            this.downloadOptionsForm.reset(this.defaultDownloadOptions, { onlySelf: true, emitEvent: true });
            this.dropDown.clear(event);
        }
        console.log("addSavedOptions " + JSON.stringify(this.dropDownItems));


        //get tthe dropdown value
        //remove from the drop down
        //do vgl reequest to do database change

    }

    public blurEvent() {
        console.log("blur event++++++++++++++");

    }

    public focusEvent() {
        if (this.selectedOptions && this.selectedOptions.bookmarkOptionName && (this.selectedOptions.bookmarkOptionName.indexOf('Default Options') >= 0)) {
            this.deleteButton.nativeElement.disabled = true;
            this.addButton.nativeElement.disabled = true;
        }
       else {
            this.deleteButton.nativeElement.disabled = false;
            this.addButton.nativeElement.disabled = false;
        }
    }

}
