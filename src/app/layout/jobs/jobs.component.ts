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
    selectedJobNode: TreeNode = null;
    jobContextMenuItems = [];

    // Jobs and selected job
    jobs: Job[] = [];
    selectedJob: Job = null;

    // Job cloud files (downloads are retrieved with Jobs)
    cloudFiles: CloudFileInformation[] = [];

    // Selected files
    selectedJobDownloads: JobDownload[] = [];
    selectedCloudFiles: CloudFileInformation[] = [];

    // Spinner flags
    jobsLoading: boolean = false;
    filesLoading: boolean = false;
    filePreviewLoading: boolean = false;

    // File panel collapsable flags
    cloudFilesIsCollapsed: boolean = false;
    jobDownloadsIsCollapsed: boolean = false;

    newFolderName: string = ""; // Name for new folder

    // Preview components
    previewItems: PreviewItem[] = [
        new PreviewItem("plaintext", PlainTextPreview, {}, ['txt', 'sh']),
        new PreviewItem("image", ImagePreview, {}, ['jpg', 'jpeg', 'gif', 'png']),
        new PreviewItem("ttl", TtlPreview, {}, ['ttl'])
    ];
    @ViewChild(PreviewDirective) previewHost: PreviewDirective;


    constructor(private componentFactoryResolver: ComponentFactoryResolver,
                private jobsService: JobsService,
                private modalService: NgbModal,
                private confirmationService: ConfirmationService) { }


    /**
     * A new job has been selected, update file panel
     * 
     * TODO: IMPORTANT! Cancel all in-progress calls when job is selected,
     * as currently it's possible cloud files will be added to wrong job XXX
     * 
     * @param event the select node event
     */
    public jobSelected(event): void {
        // Reset Job object and file tree objects
        this.selectedJob = null;
        this.cloudFiles = [];

        this.selectedJobDownloads = [];
        this.selectedCloudFiles = [];

        if(event.node && event.node.data.leaf) {
            this.selectedJob = this.jobs.find(j => j.id === event.node.data.id);
            if(this.selectedJob) {
                // Create context menu
                this.jobContextMenuItems = this.createJobContextMenu();

                // Request job cloud files
                this.jobsService.getJobCloudFiles(this.selectedJob.id).subscribe(
                    // TODO: VGL seems to filter some files
                    fileDetails => this.cloudFiles = fileDetails,
                    // TODO: Proper error reporting
                    error => {
                        console.log(error.message);
                    }
                );
                // TODO: Include Job.jobFiles (part of Job object)? No examples...
            }
        }
    }


    /**
     * TODO: Cache selected jobs so we don't need to re-download?
     * 
     * @param event 
     */
    public jobDownloadSelected(event): void {
        // TODO: Deselect anything in cloud file table if meta key wasn't used
    }


    /**
     * TODO: Cache selected jobs so we don't need to re-download?
     * TODO: Deselect anything in job download table if meta key wasn't used
     * 
     * @param event 
     */
    public jobCloudFileSelected(event): void {
        // Clear preview panel
        let viewContainerRef = this.previewHost.viewContainerRef;
        viewContainerRef.clear();        

        const extension = this.selectedCloudFiles[0].name.substr(this.selectedCloudFiles[0].name.lastIndexOf('.') + 1).toLowerCase();
        let previewItem: PreviewItem = this.previewItems.find(item => item.extensions.indexOf(extension) > -1);
        if(previewItem && (previewItem.type === 'plaintext' || previewItem.type==='ttl')) {
            this.filePreviewLoading = true;
            // TODO: Max file size to config
            this.jobsService.getPlaintextPreview(this.selectedJob.id, this.selectedCloudFiles[0].name, 512).subscribe(
                preview => {
                    this.previewFile(previewItem, preview);
                    this.filePreviewLoading = false;
                },
                error => {
                    //TODO: Proper error reporting
                    this.filePreviewLoading = false;
                    console.log(error.message);
                }
            );
        } else if(previewItem && previewItem.type === 'image') {
            this.previewFile(previewItem, this.selectedCloudFiles[0].publicUrl);
        }
    }


    /**
     * Build the job context menu based on job status
     * 
     * TODO: Delete series
     */
    public createJobContextMenu(): any[] {
        let items: any[] = [];
        if(this.selectedJob) {
            console.log("Selected job status: " + this.selectedJob.status);
            items.push({label: 'Delete', icon: 'fa-trash', command: (event) => this.deleteJob()});
            if(this.selectedJob.status.toLowerCase() === 'done' || this.selectedJob.status.toLowerCase() === 'error') {
                items.push({label: 'Duplicate', icon: 'fa-copy', command: (event) => this.duplicateJob()});
                items.push({label: 'Status', icon: 'fa-info-circle', command: (event) => this.jobStatus()});
            } else if(this.selectedJob.status.toLowerCase()==='saved') {
                items.push({label: 'Submit', icon: 'fa-share-square', command: (event) => this.submitJob()});
                items.push({label: 'Edit', icon: 'fa-edit', command: (event) => this.editJob()});
            }
        }
        return items;
    }


    /**
     * Delete selected job (job context menu)
     */
    public deleteJob(): void {
        if(this.selectedJob) {
            const message = 'Are you sure want to delete the job <strong>' + this.selectedJob.name + '</strong>';
            this.confirmationService.confirm({
                message: message,
                header: 'Delete Job',
                icon: 'fa fa-trash',
                accept: () => {
                    this.jobsService.deleteJob(this.selectedJob.id).subscribe(
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
    public duplicateJob(): void {
        
    }


    /**
     * Get the status of the selected job (job context menu)
     */
    public jobStatus(): void {
        
    }


    /**
     * Submit selected job (job context menu)
     */
    public submitJob(): void {

    }


    /**
     * Edit selected job (job context menu)
     */
    public editJob(): void {

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
        for(let f of this.selectedCloudFiles) {
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
        if(this.selectedJobDownloads.length > 0 && this.selectedCloudFiles.length > 0) {
            // TODO: Output message:
            // "Sorry, but combining multiple file categories isn't supported. Please only select files from the same category and try again."
        } else {
            if(this.selectedJobDownloads.length === 1) {
                // XXX

            } else if(this.selectedJobDownloads.length > 1) {
                // XXX

            } else if(this.selectedCloudFiles.length === 1) {
                this.downloadSingleFile();
            } else if(this.selectedCloudFiles.length > 1) {
                this.downloadFilesAsZip()
            }
        }
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
    /*
    private previewFile(filename: string, data: any) {
        const extension = filename.substr(filename.lastIndexOf('.') + 1).toLowerCase();
        let previewItem: PreviewItem = this.previewItems.find(item => item.extensions.indexOf(extension) > -1);
        if(!previewItem) {
            // TODO: Proper error reporting
            console.log("No preview for files of type: " + extension);
            return;
        }
        previewItem.data = data;
        let viewContainerRef = this.previewHost.viewContainerRef;
        viewContainerRef.clear();        
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(previewItem.component);
        let componentRef = viewContainerRef.createComponent(componentFactory);
        (<PreviewComponent>componentRef.instance).data = previewItem.data;
    }
    */


    public refreshFilePreview() {

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
        // We don't want to add the root node to the tree, it will just be the user name
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
        this.jobsLoading = true;
        this.jobs = [];
        this.selectedJob = null;
        this.treeJobsData = [];
        this.selectedJobNode = null;
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
            if(result==='OK click' && this.newFolderName !== '') {
                this.addFolder(this.newFolderName);
            }
        });
    }


    ngOnInit() {
        this.refreshJobs();
    }
}
