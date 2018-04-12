import { Component, OnInit, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { TreeJobs, TreeJobNode, Job, JobFile, CloudFileInformation, JobDownload, PreviewComponent } from '../../shared/modules/vgl/models';
import { JobsService } from './jobs.service';
import { TreeNode, ConfirmationService } from 'primeng/api';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { saveAs } from 'file-saver/FileSaver';
import { PreviewDirective } from './preview/preview.directive';
import { PlainTextPreview } from './preview/plaintext-preview.component';
import { ImagePreview } from './preview/image-preview.component';
import { PreviewItem } from './preview/preview-item';
import { TtlPreview } from './preview/ttl-preview.component';
import { DataServicePreview } from './preview/data-service-preview.component';


@Component({
    selector: 'app-jobs',
    templateUrl: './jobs.component.html',
    styleUrls: [
        './jobs.component.scss'
    ],
    animations: [routerTransition()]
})


export class JobsComponent implements OnInit {

    // Job tree
    treeJobsData: TreeNode[] = [];
    selectedJobNodes: TreeNode[] = [];
    jobContextMenuItems = [];

    // Jobs and selected job
    jobs: Job[] = [];
    displayedJob: Job = null;

    // Job cloud files (downloads are retrieved with Jobs)
    cloudFiles: CloudFileInformation[] = [];

    // Selected files
    selectedJobDownloads: JobDownload[] = [];
    selectedCloudFiles: CloudFileInformation[] = [];

    // Spinner flags
    jobsLoading: boolean = false;
    cloudFilesLoading: boolean = false;
    filePreviewLoading: boolean = false;

    // File panel collapsable flags
    cloudFilesIsCollapsed: boolean = false;
    jobDownloadsIsCollapsed: boolean = false;

    newFolderName: string = ""; // Name for new folder

    // Preview components
    previewItems: PreviewItem[] = [
        new PreviewItem("data-service", DataServicePreview, {}, []),
        new PreviewItem("plaintext", PlainTextPreview, {}, ['txt', 'sh']),
        new PreviewItem("image", ImagePreview, {}, ['jpg', 'jpeg', 'gif', 'png']),
        new PreviewItem("ttl", TtlPreview, {}, ['ttl'])
    ];
    @ViewChild(PreviewDirective) previewHost: PreviewDirective;
    // Will be JobDownload or CloudFileInformation, needed for preview Refresh
    currentPreviewObject: any = null;

    // Job context menu actions
    cancelJobAction = { label: 'Cancel', icon: 'fa-times', command: (event) => this.cancelSelectedJob() };
    duplicateJobAction = { label: 'Duplicate', icon: 'fa-edit', command: (event) => this.duplicateSelectedJob() };
    deleteJobAction = { label: 'Delete', icon: 'fa-trash', command: (event) => this.deleteSelectedJob() };
    submitJobAction = { label: 'Submit', icon: 'fa-share-square', command: (event) => this.submitSelectedJob() };
    editJobAction = { label: 'Edit', icon: 'fa-edit', command: (event) => this.editSelectedJob() };


    constructor(private componentFactoryResolver: ComponentFactoryResolver,
        private jobsService: JobsService,
        private modalService: NgbModal,
        private confirmationService: ConfirmationService) { }
    

    ngOnInit() {
        this.refreshJobs();
    }


    /**
     * Convert a VGL TreeNode to an p-treetable TreeNode
     * 
     * @param treeNode the TreeNode to convert to an p-treetable TreeNode
     */
    private createTreeJobNode(treeNode: TreeJobNode): TreeNode {
        let node: TreeNode = {};
        node.data = {
            "id": treeNode.id,
            "name": treeNode.name,
            "submitDate": treeNode.submitDate,
            "status": treeNode.status,
            "leaf": treeNode.leaf
        }
        if (treeNode.hasOwnProperty('children') && treeNode.children.length > 0) {
            node.children = [];
            for (let treeNodeChild of treeNode.children) {
                node.children.push(this.createTreeJobNode(treeNodeChild));
            }
        }
        return node;
    }


    /**
     * Transform the TreeJobs data that VGL returns into the TreeNode data
     * that p-treetable requires
     * 
     * TODO: Sort. No column sorting available, but ng-treetable alternative
     * to p-table may be able to do this
     * 
     * @param treeJobs the TreeJobs data returned from VGL
     */
    private createTreeJobsData(treeJobs: TreeJobs): TreeNode[] {
        let treeData: TreeNode[] = [];
        // Skip root node (user name)
        let rootNode: TreeJobNode = treeJobs.nodes;
        if (rootNode.hasOwnProperty('children') && rootNode.children.length > 0) {
            for (let treeNodeChild of rootNode.children) {
                treeData.push(this.createTreeJobNode(treeNodeChild));
            }
        }
        return treeData;
    }


    /**
     * 
     */
    public refreshJobs(): void {
        // Reset spinners
        this.jobsLoading = true;
        this.filePreviewLoading = false;
        this.cloudFilesLoading = false;

        // Reset job and file objects
        this.jobs = [];
        this.selectedCloudFiles = [];
        this.selectedJobDownloads = [];
        this.displayedJob = null;
        this.treeJobsData = [];
        this.selectedJobNodes = [];

        this.currentPreviewObject = null;

        // Load jobs
        this.jobsService.getTreeJobs().subscribe(
            treeJobs => {
                this.treeJobsData = this.createTreeJobsData(treeJobs);
                this.jobs = treeJobs.jobs;
                this.jobsLoading = false;
            },
            // TODO: Proper error reporting
            error => {
                this.jobsLoading = false;
                console.log("Error: " + error.message);
            }
        );
    }


    /**
     * A new job has been selected, update file panel
     * 
     * TODO: IMPORTANT! Cancel all in-progress calls when job is selected,
     * as currently it's possible cloud files will be added to wrong job XXX
     * 
     * @param event the select node event
     */
    public jobSelected(event): void {
        if (event.node && event.node.data.leaf) {
            this.displayedJob = this.jobs.find(j => j.id === event.node.data.id);
            if (this.displayedJob) {
                // Reset file selections
                this.selectedJobDownloads = [];
                this.selectedCloudFiles = [];
                this.filePreviewLoading = false;
                if(this.previewHost) {
                    let viewContainerRef = this.previewHost.viewContainerRef;
                    viewContainerRef.clear();
                }
                // Request job cloud files
                this.cloudFiles = [];
                this.cloudFilesLoading = true;
                this.jobsService.getJobCloudFiles(this.displayedJob.id).subscribe(
                    // TODO: VGL seems to filter some files
                    fileDetails => {
                        // XXX Server was not returning error when the associated S3 bucket didn't exist
                        if(!fileDetails) {
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
                // TODO: Include Job.jobFiles (part of Job object)? No examples...
            }
        }
        this.jobContextMenuItems = this.createJobContextMenu();
    }


    /**
     * Build the job context menu based on job status
     */
    public createJobContextMenu(): any[] {
        let items: any[] = [];
        // If more than 1 item is selected, or only a series is selected, delete is only action
        if (this.selectedJobNodes.length > 1 || !this.displayedJob) {
            items.push({ label: 'Delete', icon: 'fa-trash', command: (event) => this.deleteSelectedJob() });
        }
        // Otherwise available actions are specific to job status
        else if (this.selectedJobNodes.length === 1 && this.displayedJob) {
            if (this.displayedJob.status.toLowerCase() === 'active') {
                items.push({ label: 'Cancel', icon: 'fa-cross', command: (event) => this.cancelSelectedJob() });
                items.push({ label: 'Duplicate', icon: 'fa-edit', command: (event) => this.duplicateSelectedJob() });
            } else if (this.displayedJob.status.toLowerCase() === 'saved') {
                items.push({ label: 'Delete', icon: 'fa-trash', command: (event) => this.deleteSelectedJob() });
                items.push({ label: 'Submit', icon: 'fa-share-square', command: (event) => this.submitSelectedJob() });
                items.push({ label: 'Edit', icon: 'fa-edit', command: (event) => this.editSelectedJob() });
            } else if (this.displayedJob.status.toLowerCase() === 'done' || this.displayedJob.status.toLowerCase() === 'error') {
                items.push({ label: 'Delete', icon: 'fa-trash', command: (event) => this.deleteSelectedJob() });
                items.push({ label: 'Duplicate', icon: 'fa-edit', command: (event) => this.duplicateSelectedJob() });
            } else {
                items.push({ label: 'Cancel', icon: 'fa-cross', command: (event) => this.cancelSelectedJob() });
                items.push({ label: 'Duplicate', icon: 'fa-edit', command: (event) => this.duplicateSelectedJob() });
            }
        }
        return items;
    }


    /**
     * 
     * @param previewItem 
     * @param data 
     */
    private previewFile(previewItem: PreviewItem, data: any) {
        previewItem.data = data;
        let viewContainerRef = this.previewHost.viewContainerRef;
        viewContainerRef.clear();
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(previewItem.component);
        let componentRef = viewContainerRef.createComponent(componentFactory);
        (<PreviewComponent>componentRef.instance).data = previewItem.data;
    }


    /**
     * 
     * @param jobDownload 
     */
    previewJobDownload(jobDownload: JobDownload): void {
        let viewContainerRef = this.previewHost.viewContainerRef;
        viewContainerRef.clear();
        let previewItem: PreviewItem = this.previewItems.find(item => item.type === 'data-service');
        this.filePreviewLoading = true;


        this.previewFile(previewItem, "");


        this.filePreviewLoading = false;
        this.currentPreviewObject = jobDownload;
    }


    /**
     * TODO: Cache selected jobs so we don't need to re-download?
     * TODO: Deselect anything in cloud file table if meta key wasn't used
     * 
     * @param event 
     */
    public jobDownloadSelected(event): void {
        const jobDownload: JobDownload = this.selectedJobDownloads[this.selectedJobDownloads.length-1];
        this.previewJobDownload(jobDownload);
    }


    /**
     * 
     * @param cloudFile 
     */
    public previewCloudFile(cloudFile: CloudFileInformation): void {
        let viewContainerRef = this.previewHost.viewContainerRef;
        viewContainerRef.clear();
        const extension = cloudFile.name.substr(cloudFile.name.lastIndexOf('.') + 1).toLowerCase();
        let previewItem: PreviewItem = this.previewItems.find(item => item.extensions.indexOf(extension) > -1);
        if (previewItem && (previewItem.type === 'plaintext' || previewItem.type === 'ttl')) {
            this.filePreviewLoading = true;
            // TODO: Max file size to config
            this.jobsService.getPlaintextPreview(this.displayedJob.id, cloudFile.name, 512).subscribe(
                preview => {
                    this.previewFile(previewItem, preview);
                    this.filePreviewLoading = false;
                    this.currentPreviewObject = cloudFile;
                },
                error => {
                    //TODO: Proper error reporting
                    this.filePreviewLoading = false;
                    console.log(error.message);
                }
            );
        } else if (previewItem && previewItem.type === 'image') {
            this.previewFile(previewItem, cloudFile.publicUrl);
        }
    }


    /**
     * TODO: Cache selected jobs so we don't need to re-download?
     * TODO: Deselect anything in job download table if meta key wasn't used
     * TODO: Remove (or change) preview on item de-selection?
     * 
     * @param event event triggered by node selection, unused
     */
    public jobCloudFileSelected(event): void {
        console.log("Selection: " + JSON.stringify(event));
        let cloudFile: CloudFileInformation = this.selectedCloudFiles[this.selectedCloudFiles.length-1];
        this.previewCloudFile(cloudFile);
    }


    /**
     * 
     */
    refreshPreview(): void {
        if(this.currentPreviewObject) {
            // Hacky type check
            if(this.currentPreviewObject.hasOwnProperty('localPath')) {
                this.previewJobDownload(this.currentPreviewObject);
            } else {
                this.previewCloudFile(this.currentPreviewObject);
            }
        }
    }

    /*
     * TODO: If the following job actions will behave similarly in other
     * classes (e.g. same dialog confirmations), move that code to job service
     */

    /**
     * Delete selected job (job context menu)
     * 
     * TODO: Delete series
     */
    public deleteSelectedJob(): void {
        if (this.displayedJob) {
            const message = 'Are you sure want to delete the job <strong>' + this.displayedJob.name + '</strong>';
            this.confirmationService.confirm({
                message: message,
                header: 'Delete Job',
                icon: 'fa fa-trash',
                accept: () => {
                    this.jobsService.deleteJob(this.displayedJob.id).subscribe(
                        response => {
                            this.refreshJobs();
                            // TODO: Success message
                        },
                        error => {
                            // TODO: Proper error reporting
                            console.log(error.message);
                        }
                    )
                }
            });
        }
    }


    /**
     * Cancel the selected job (job context menu)
     */
    public cancelSelectedJob(): void {
        if (this.displayedJob) {
            const message = 'Are you sure want to cancel the job <strong>' + this.displayedJob.name + '</strong>';
            this.confirmationService.confirm({
                message: message,
                header: 'Cancel Job',
                icon: 'fa fa-times',
                accept: () => {
                    this.jobsService.cancelJob(this.displayedJob.id).subscribe(
                        response => {
                            this.refreshJobs();
                            // TODO: Success message
                        },
                        error => {
                            // TODO: Proper error reporting
                            console.log(error.message);
                        }
                    )
                }
            });
        }
    }


    /**
     * Duplicate selected job (job context menu)
     */
    public duplicateSelectedJob(): void {

    }


    /**
     * Get the status of the selected job (job context menu)
     */
    public showSelectedJobStatus(): void {

    }


    /**
     * Submit selected job (job context menu)
     */
    public submitSelectedJob(): void {

    }


    /**
     * Edit selected job (job context menu)
     */
    public editSelectedJob(): void {

    }


    /**
     * XXX This is specific to cloud files, may need to make genera
     * 
     * TODO: Cache selected jobs so we don't need to re-download?
     */
    public downloadSingleFile(): void {
        this.jobsService.downloadFile(this.displayedJob.id, this.selectedCloudFiles[0].name, this.selectedCloudFiles[0].name).subscribe(
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
        this.jobsService.downloadFilesAsZip(this.displayedJob.id, files).subscribe(
            response => {
                saveAs(response, 'Job_' + this.displayedJob.id.toString() + '.zip');
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


    /**
     * 
     * @param folderName the name of the folder to be added
     */
    public addFolder(folderName: string): void {
        this.jobsService.addFolder(folderName).subscribe(
            series => {
                console.log(JSON.stringify(series));
            },
            // TODO: Proper error reporting
            error => {
                console.log(error.message);
            }
        );
    }


    /**
     * 
     * @param content the add folder modal content
     */
    public showAddFolderModal(content): void {
        this.newFolderName = "";
        this.modalService.open(content).result.then((result) => {
            if (result === 'OK click' && this.newFolderName !== '') {
                this.addFolder(this.newFolderName);
            }
        });
    }
    
}
