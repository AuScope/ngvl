import { Component, Input, Output, EventEmitter, OnChanges } from "@angular/core";
import { CloudFileInformation, JobDownload, Job } from "../../shared/modules/vgl/models";
import { JobsService } from "./jobs.service";
import { saveAs } from 'file-saver/FileSaver';
import { Subscription } from "rxjs";


@Component({
    selector: 'job-inputs',
    templateUrl: './job-inputs.component.html',
    styleUrls: ['./job-inputs.component.scss']
})


export class JobInputsComponent implements OnChanges {

    // Selected job the inputs will be retrieved for
    @Input() public selectedJob: Job = null;
    // Job download and cloud file table selection modes
    @Input() public selectionMode: string = "multiple";
    // Display checkboxes on headers and table items?
    @Input() public showCheckboxes: boolean = false;
    // Input change event
    @Output() inputSelectionChanged = new EventEmitter();

    // HttpCLient request (for cancelling)
    httpSubscription: Subscription;

    // Job cloud files (downloads are retrieved with Jobs)
    cloudFiles: CloudFileInformation[] = [];

    // Selected files
    selectedJobDownloads: JobDownload[] = [];
    selectedCloudFiles: CloudFileInformation[] = [];

    // Cloud file loading for spinner flag
    cloudFilesLoading: boolean = false;

    // File panel collapsable flags
    cloudFilesIsCollapsed: boolean = false;
    jobDownloadsIsCollapsed: boolean = false;

    // Table columns
    downloadTableColumns = [
        { field: 'name', header: 'Name' },
        { field: 'url', header: 'Details' }
    ]

    cloudFileTableColumns = [
        { field: 'name', header: 'Name' },
        { field: 'size', header: 'Details' }
    ]


    constructor(private jobsService: JobsService) { }


    /**
     * Reset input details when job is changed
     */
    ngOnChanges() {
        this.resetInputsForSelectedJob();
    }


    /**
     * Cancel the current HttpClient request, if any
     */
    public cancelCurrentSubscription() {
        if (this.httpSubscription && !this.httpSubscription.closed) {
            this.httpSubscription.unsubscribe();
        }
    }


    /**
     * When a new job is selected, reset inputs
     */
    public resetInputsForSelectedJob(): void {
        // Reset file selections
        this.selectedJobDownloads = [];
        this.selectedCloudFiles = [];

        // Request job cloud files
        this.cloudFiles = [];

        this.cancelCurrentSubscription();
        
        if(this.selectedJob) {
            this.cloudFilesLoading = true;
            this.httpSubscription = this.jobsService.getJobCloudFiles(this.selectedJob.id).subscribe(
                // TODO: VGL seems to filter some files
                fileDetails => {
                    // XXX Server was not returning error when the associated S3 bucket didn't exist
                    if (!fileDetails) {
                        this.cloudFiles = [];
                    } else {
                        this.cloudFiles = fileDetails
                    }
                    this.cloudFilesLoading = false;
                },
                // TODO: Proper error reporting
                error => {
                    this.cloudFilesLoading = false;
                    console.log(error.message);
                }
            );
        }
    }


    /**
     * TODO: Cache selected jobs so we don't need to re-download?
     * TODO: Deselect anything in cloud file table if meta key wasn't used
     * 
     * @param event 
     */
    public jobDownloadSelected(event): void {
        this.cancelCurrentSubscription();
        // Clear any selections from the cloud file table if meta key was not
        // used
        if(!this.showCheckboxes && !event.originalEvent.ctrlKey) {
            this.selectedCloudFiles = [];
        }
        const jobDownload: JobDownload = this.selectedJobDownloads[this.selectedJobDownloads.length - 1];
        this.inputSelectionChanged.emit(jobDownload);
    }


    /**
     * TODO: Cache selected jobs so we don't need to re-download?
     * TODO: Deselect anything in job download table if meta key wasn't used
     * TODO: Remove (or change) preview on item de-selection?
     * 
     * @param event event triggered by node selection, unused
     */
    public jobCloudFileSelected(event): void {
        this.cancelCurrentSubscription();
        // Clear any selections from the download table if meta key was not
        // used
        if(!this.showCheckboxes && !event.originalEvent.ctrlKey) {
            this.selectedJobDownloads = [];
        }
        let cloudFile: CloudFileInformation = this.selectedCloudFiles[this.selectedCloudFiles.length - 1];
        this.inputSelectionChanged.emit(cloudFile);
    }


    /**
     * XXX This is specific to cloud files, may need to make genera
     * 
     * TODO: Cache selected jobs so we don't need to re-download?
     */
    public downloadSingleFile(): void {
        this.jobsService.downloadFile(this.selectedJob.id, this.selectedCloudFiles[0].name, this.selectedCloudFiles[0].name).subscribe(
            response => {
                saveAs(response, this.selectedCloudFiles[0].name);
            },
            error => {
                //TODO: Proper error reporting
                console.log(error.message);
            }
        )
    }


    /**
     * XXX This is specific to cloud files, may need to make general
     */
    public downloadFilesAsZip(): void {
        let files: string[] = [];
        for (let f of this.selectedCloudFiles) {
            files.push(f.name);
        }
        this.jobsService.downloadFilesAsZip(this.selectedJob.id, files).subscribe(
            response => {
                saveAs(response, 'Job_' + this.selectedJob.id.toString() + '.zip');
            },
            error => {
                //TODO: Proper error reporting
                console.log(error.message);
            }
        )
    }


    /**
     * Download selected job files (downloads and ckoud files). Individual
     * files are downloaded in their native format, multiple files will be
     * zipped
     * 
     * TODO: Figure out how to do data service downloads XXX
     * TODO: Report any errors
     */
    public downloadSelectedFiles(): void {
        if (this.selectedJobDownloads.length > 0 && this.selectedCloudFiles.length > 0) {
            // TODO: Output message:
            // "Sorry, but combining multiple file categories isn't supported. Please only select files from the same category and try again."
        } else {
            if (this.selectedJobDownloads.length === 1) {
                // XXX

            } else if (this.selectedJobDownloads.length > 1) {
                // XXX

            } else if (this.selectedCloudFiles.length === 1) {
                this.downloadSingleFile();
            } else if (this.selectedCloudFiles.length > 1) {
                this.downloadFilesAsZip()
            }
        }
    }

}