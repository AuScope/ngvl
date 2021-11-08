import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, OnInit } from "@angular/core";
import { CloudFileInformation, JobDownload, Job, CloudDirectoryInformation } from "../../shared/modules/vgl/models";
import { JobsService } from "./jobs.service";
import { saveAs } from 'file-saver';
import { Subscription } from "rxjs";
import { TreeNode } from "primeng/api";
import { TimerObservable } from "rxjs/observable/TimerObservable";

@Component({
    selector: 'app-job-inputs',
    templateUrl: './job-inputs.component.html',
    styleUrls: ['./job-inputs.component.scss']
})


export class JobInputsComponent implements OnInit, OnChanges, OnDestroy {

    // Selected job the inputs will be retrieved for
    @Input() public selectedJob: Job = null;
    // Job download and cloud file table selection modes
    @Input() public selectionMode: string = "multiple";
    // Display checkboxes on headers and table items?
    @Input() public showCheckboxes: boolean = false;
    // Input change event
    @Output() inputSelectionChanged = new EventEmitter();
    // file size change event
    @Output() inputSizeChanged = new EventEmitter();

    // HttpClient request (for cancelling)
    httpSubscription: Subscription;

    // Job cloud files as treetable nodes (downloads are retrieved with Jobs)
    cloudFileTreeTableData: TreeNode[];

    // Selected files
    selectedJobDownloads: JobDownload[] = [];
    selectedCloudFileTreeNodes: TreeNode[] = [];
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
    ];

    // Cloud file treetable columns
    cloudFileTreeTableColumns: any[] = [
        { field: 'name', header: 'Name', colStyle: { 'width': '70%' } },
        { field: 'size', header: 'Details', colStyle: { 'width': '30%' } }
    ];

    private fileUpdateSubscription: Subscription;

    constructor(private jobsService: JobsService) { }


    ngOnInit() {
        let timer = TimerObservable.create(60000, 60000);
        this.fileUpdateSubscription = timer.subscribe(timer => {
            if (this.selectedJob) {
                this.httpSubscription = this.jobsService.getJobCloudDirectoriesAndFiles(this.selectedJob.id).subscribe(rootOutputDirectory => {
                    if (rootOutputDirectory) {
                        this.cloudFileTreeTableData = this.createCloudDirectoryTreeNodes(rootOutputDirectory);
                    }
                }, error => {
                    // TODO: Proper error reporting
                    console.log(error.message);
                });
            }
        });
    }

    ngOnDestroy() {
        this.fileUpdateSubscription.unsubscribe();
    }

    /**
     * Reset input details when job is changed
     */
    ngOnChanges() {
        this.resetInputsForSelectedJob();
    }


    /**
     * Connstruct an array of TreeNodes for a specified cloud directory from which to build a TreeTabel from.
     *
     * @param cloudDirectory the CloudDirectoryInformation object to build the TreeTable from
     */
    private createCloudDirectoryTreeNodes(cloudDirectory: CloudDirectoryInformation): TreeNode[] {
        const nodes: TreeNode[] = [];
        for (const cloudFile of cloudDirectory.files) {
            const fileNode = {
                "data": {
                    "cloudObject": cloudFile
                },
                "leaf": true
            };
            nodes.push(fileNode);
        }
        if (cloudDirectory.directories.length > 0) {
            for (const childDir of cloudDirectory.directories) {
                const dirNode = {
                    "data": {
                        "cloudObject": childDir,
                    },
                    "leaf": false,
                    "children": this.createCloudDirectoryTreeNodes(childDir)
                };
                nodes.push(dirNode);
            }
        }
        return nodes;
    }

    /**
     * Return the selected job downloads
     */
    public getSelectedJobDownloads(): JobDownload[] {
        return this.selectedJobDownloads;
    }


    /**
     * Return the selected job cloud files
     */
    public getSelectedCloudFiles(): CloudFileInformation[] {
        return this.selectedCloudFiles;
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
        this.cancelCurrentSubscription();

        // Reset file selections
        this.selectedJobDownloads = [];
        this.selectedCloudFileTreeNodes = [];
        this.selectedCloudFiles = [];

        // Request job cloud files
        this.cloudFileTreeTableData = [];
        if (this.selectedJob) {
            this.cloudFilesLoading = true;
            this.httpSubscription = this.jobsService.getJobCloudDirectoriesAndFiles(this.selectedJob.id).subscribe(rootOutputDirectory => {
                if (rootOutputDirectory) {
                    this.cloudFileTreeTableData = this.createCloudDirectoryTreeNodes(rootOutputDirectory);
                    this.cloudFilesLoading = false;
                }
            }, error => {
                // TODO: Proper error reporting
                this.cloudFilesLoading = false;
                console.log(error.message);
            });
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
        if (!this.showCheckboxes && !event.originalEvent.ctrlKey) {
            this.selectedCloudFiles = [];
            this.selectedCloudFileTreeNodes = [];
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
        if (!this.showCheckboxes && !event.originalEvent.ctrlKey) {
            this.selectedJobDownloads = [];
        }

        if (event.node.leaf) {
            const cloudFile = { ...event.node.data.cloudObject };
            // If this leaf has a parent (directory) then we need to prepend the full path to the name of the file
            if (event.node.parent) {
                cloudFile.name = event.node.parent.data.cloudObject.path + cloudFile.name;
            }
           this.inputSelectionChanged.emit(cloudFile);
        }

        // Build selectedCloudFiles array from selectedCloudFileTreeNodes
        this.selectedCloudFiles = [];
        for (const treeNode of this.selectedCloudFileTreeNodes) {
            let cloudFile: CloudFileInformation = { ...treeNode.data.cloudObject };
            if (treeNode.parent) {
                cloudFile.name = treeNode.parent.data.cloudObject.path + treeNode.data.cloudObject.name;
            }
            this.selectedCloudFiles.push(cloudFile);
        }
    }


    /**
     * TODO: This is specific to cloud files, may need to make general
     *
     * TODO: Cache selected jobs so we don't need to re-download?
     */
    public downloadSingleFile(): void {
        this.jobsService.downloadFile(this.selectedJob.id, this.selectedCloudFiles[0].name, this.selectedCloudFiles[0].name).subscribe(
            response => {
                saveAs(response, this.selectedCloudFiles[0].name);
            },
            error => {
                // TODO: Proper error reporting
                console.log(error.message);
            }
        );
    }


    /**
     * Download selected files as a zip file
     * TODO: This is specific to cloud files, may need to make general
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
                // TODO: Proper error reporting
                console.log(error.message);
            }
        );
    }


    /**
     * Download selected job files (downloads and cloud files). Individual
     * files are downloaded in their native format, multiple files will be
     * zipped
     *
     * TODO: Figure out how to do data service downloads
     * TODO: Report any errors
     */
    public downloadSelectedFiles(): void {
        if (this.selectedJobDownloads.length > 0 && this.selectedCloudFiles.length > 0) {
            // TODO: Output message:
            // "Sorry, but combining multiple file categories isn't supported. Please only select files from the same category and try again."
        } else {
            if (this.selectedJobDownloads.length === 1) {
                // TODO: Simply opens a new window with the download URL, check this works in all cases
                window.open(this.selectedJobDownloads[0].url);
            } else if (this.selectedJobDownloads.length > 1) {
                // TODO: Deal with multiple downloads, this will only open first selection
                window.open(this.selectedJobDownloads[0].url);
            } else if (this.selectedCloudFiles.length === 1) {
                this.downloadSingleFile();
            } else if (this.selectedCloudFiles.length > 1) {
                this.downloadFilesAsZip();
            }
        }
    }

}
