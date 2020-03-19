import { Component, Input, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DownloadOptions, DescribeCoverage } from '../../shared/modules/vgl/models';
import { VglService } from '../../shared/modules/vgl/vgl.service';
import { CSWSearchService } from '../../shared/services/csw-search.service';
import { Dropdown } from "primeng/components/dropdown/dropdown";
import { SelectItem } from 'primeng/api';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-download-options-modal-content',
    templateUrl: './download-options.modal.component.html',
    styleUrls: ['./download-options.modal.component.scss']
})


export class DownloadOptionsModalComponent implements OnInit {

    // Validator patterns
    LATITUDE_PATTERN = '^(\\+|-)?(?:90(?:(?:\\.0{1,20})?)|(?:[0-9]|[1-8][0-9])(?:(?:\\.[0-9]{1,20})?))$';
    LONGITUDE_PATTERN = '^(\\+|-)?(?:180(?:(?:\\.0{1,20})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\\.[0-9]{1,20})?))$';

    @Input() public downloadOptions: DownloadOptions;
    /* Default options are passed as a separate object so that defaults can be restored */
    @Input() public defaultDownloadOptions: DownloadOptions;
    @Input() public onlineResource: any;
    @Input() isBMarked: boolean;
    @Input() cswRecord: CSWRecordModel;
    downloadOptionsForm: FormGroup;
    dataTypes: any[] = [];

    /* array for the drop down */
    @Input() dropDownItems: SelectItem[] = [];
    /* selected item in the drop down */
    selectedOptions: DownloadOptions;

    /*decorators used to acccess drop down, add and remove buttons in html */
    @ViewChild('dropDown') private dropDown: Dropdown;
    @ViewChild('addButton') private addButton: ElementRef;
    @ViewChild('deleteButton') private deleteButton: ElementRef;


    constructor(private formBuilder: FormBuilder,
        public activeModal: NgbActiveModal,
        private vglService: VglService,
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
        );
        return outputFormats;
    }

    /**
     * Small hack to get the select format control to update at start
     */
    hasFocus(): boolean {
        return true;
    }

    /**
     * TODO: Pass in valid types
     * 
     * @param type the type of the online resource, will be 'WCS' or 'WFS'
     */
    private populateDataTypes() {
        if (this.onlineResource.type === 'WFS') {
            this.dataTypes = this.getFeatureRequestOutputFormats(this.onlineResource.serviceUrl);
        } else if (this.onlineResource.type === 'WCS') {
            this.dataTypes = [];
            this.vglService.describeCoverage(this.onlineResource.url, this.onlineResource.name).subscribe((response: DescribeCoverage[]) => {
                if(response.length > 0 && response[0].supportedFormats) {
                    for(let format of response[0].supportedFormats) {
                        switch(format.toLowerCase()) {
                            case "csv":
                                this.dataTypes.push({ label: 'CSV', urn: 'csv'});
                            break;
                            case "netcdf":
                                this.dataTypes.push({ label: 'NetCDF', urn: 'netcdf'});
                            break;
                            case "geotiff":
                                this.dataTypes.push({ label: 'GeoTIFF', urn: 'geotiff'});
                            break;
                            /* XXX Was the ERDDAP?
                            case "netcdf":
                                this.dataTypes.push({ label: 'NetCDF', urn: 'nc'});
                            break;
                            case "geotiff":
                                this.dataTypes.push({ label: 'GeoTIFF', urn: 'geotif'});
                            break;
                            */
                        }
                    }
                    //this.downloadOptionsForm.controls.format.setValue(this.dataTypes[0].urn, {onlySelf: true});
                    //this.downloadOptionsForm.controls.format.updateValueAndValidity();
                }
            }, error => {
                // TODO: Deal with error
            }, () => {
                if(this.dataTypes.length == 0) {
                    this.dataTypes = [
                        { label: 'CSV', urn: 'csv' },
                        { label: 'GeoTIFF', urn: 'geotiff' },
                        { label: 'NetCDF', urn: 'netcdf' }
                        /*
                        { label: 'CSV', urn: 'csv' },
                        { label: 'GeoTIFF', urn: 'geotif' },
                        { label: 'NetCDF', urn: 'nc' }
                        */
                    ];
                }
                this.downloadOptionsForm.controls.format.updateValueAndValidity();
            });
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
                case "outputWidth": {
                    optionsGroup['outputWidth'] = [this.downloadOptions.outputWidth, Validators.required];
                    break;
                }
                case "outputHeight": {
                    optionsGroup['outputHeight'] = [this.downloadOptions.outputHeight, Validators.required];
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
     * Checks if a object is of type interface Downloadoptions.
     * This was necessary as primeng editable dropdown component was
     * returning select item as a string when the drop down is edited to enter a new value.
     *
     * @param obj
     */
    private isDownloadOptions(obj: any): obj is DownloadOptions {
        return obj && obj.bookmarkOptionName !== undefined;
    }

    /**
     * Checks if item selected is of default download options
     * @param obj
     */
    private isDefaultDownloadOptions(obj: DownloadOptions) {
        return obj && (obj.bookmarkOptionName.indexOf('Default Options') === 0);
    }

    /**
     * Checks if download options are bookmarked and returns the index.
     * Used when adding and removing bookmarks for download options
     * @param bookmarkOptionName
     */
    private bookmarkExists(bookmarkOptionName: string) {
        let index = this.dropDownItems.findIndex(item => {
            return (item.value.bookmarkOptionName.indexOf(bookmarkOptionName) === 0);
        });
        return index;
    }


    /**
     * This is executed on onChange event of the dropdown. Changes the form fields based on the
     * selection in the dropdown. Also enables and disables add/ remove buttons based on user input
     * like enetering a new book mark or selection of existing book marks for the download options.
     */
    public selectBookMarkOptions() {
        if (this.isDownloadOptions(this.selectedOptions)) {
            this.downloadOptionsForm.reset(this.selectedOptions, { onlySelf: true, emitEvent: true });
            this.addButton.nativeElement.disabled = true;
            if (this.isDefaultDownloadOptions(this.selectedOptions)) {
                this.deleteButton.nativeElement.disabled = true;
            } else {
                this.deleteButton.nativeElement.disabled = false;
            }
        }
        if (!this.isDownloadOptions(this.selectedOptions)) {
            this.addButton.nativeElement.disabled = false;
            this.deleteButton.nativeElement.disabled = true;
        }

    }

    /**
     * Adds a bookmark for the download options in the drop down.
     */
    public addBookMarkOptions() {
        // primeng component returns selectedOptions as a string object when user edits the dropdown to enter a new value.
        // Hence it was necessary to check the type of the object
        if ((typeof this.selectedOptions === "string") && (this.bookmarkExists(this.selectedOptions) === -1)) {
            let savedOptionsName: string = this.selectedOptions;
            // Get updated options from the form fields
            for (let option in this.downloadOptions) {
                if (this.downloadOptionsForm.controls.hasOwnProperty(option)) {
                    this.downloadOptions[option] = this.downloadOptionsForm.controls[option].value;
                }
            }
            this.downloadOptions.bookmarkOptionName = savedOptionsName;
            // saves the download options as a bookmark under the user entered bookmark name.
            this.vglService.bookMarkDownloadOptions(this.cswSearchService.getBookMarkId(this.cswRecord), this.downloadOptions).subscribe(id => {
                // updates downloadload options object with id and includes it in the drop down items
                this.downloadOptions.id = id;
                this.dropDownItems.push({ label: savedOptionsName, value: JSON.parse(JSON.stringify(this.downloadOptions)) });
            }, error => {
                console.log(error.message);
            });
        }
    }

    /**
     * removes bookmarked options from the bookmarks in the drop down.
     */
    public deleteBookMarkOptions() {
        // Gets the index of item to be removed from the dropdown items
        let index: number;
        if ((typeof this.selectedOptions === "string")) {
            index = this.bookmarkExists(this.selectedOptions);
        } else {
            index = this.bookmarkExists(this.selectedOptions.bookmarkOptionName);
        }
        // proceed to remove if item is present both from DB and dropdown SelctItems[]
        if (index > -1) {
            let optionsId = this.dropDownItems[index].value.id;
            this.vglService.deleteDownloadOptions(optionsId).subscribe(() => {
                this.dropDownItems.splice(index, 1);
                this.downloadOptionsForm.reset(this.defaultDownloadOptions, { onlySelf: true, emitEvent: true });
                this.dropDown.clear(event);
            });
        }
    }
}
