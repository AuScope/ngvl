import { Component } from '@angular/core';
import { TreeJobs, TreeJobNode, JobDownload, JobFile, CloudFileInformation } from '../../../shared/modules/vgl/models';
import { UserStateService } from '../../../shared';
import { JobInputsBrowserModalContent } from './job-inputs-browser.modal.component';
import { TreeNode } from 'primeng/api';
import { JobsService } from '../jobs.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { saveAs } from 'file-saver';
import { VglService } from '../../../shared/modules/vgl/vgl.service';


@Component({
    selector: 'job-submission-datasets',
    templateUrl: './job-submission-datasets.component.html',
    styleUrls: ['./job-submission-datasets.component.scss']
})


export class JobSubmissionDatasetsComponent {

    // Job input file tree (input type root nodes added to this)
    jobInputNodes: TreeNode[];
    treeCols = [
        { header: 'Name', field: 'name', colStyle: { 'width': '20%' } },
        { header: 'Location', field: 'location', colStyle: { 'width': '20%' } },
        { header: 'Description', field: 'description', colStyle: { 'width': '30%' } },
        { header: 'Details', field: 'details', colStyle: { 'width': '30%' } }
    ];

    // Selected input (single selection)
    selectedJobInputNode: TreeNode;

    // Context menu selection (only stored so we can clear it when user makes
    // a non-context selection)
    selectedContextNode: TreeNode;

    // Root remote web service node (user selected datasets and copied remote downloads)
    rootRemoteWebServiceDownloads: TreeNode = {
        data: {
            name: "Remote Web Service Downloads",
            id: "remote",
            expanded: true,
            leaf: false
        },
        children: []
    }

    // Root files node (copied CloudFileInformation and user uploaded files)
    rootFileDownloads: TreeNode = {
        data: {
            name: "Your Uploaded Files",
            id: "upload",
            expanded: true,
            leaf: false
        },
        children: []
    }

    // Job download context menu and actions
    jobInputContextMenuItems = [];

    downloadContextMenuAction = {
        label: 'Download to your machine',
        icon: 'fa fa-download',
        command: (event) => this.downloadSelectedInput()
    }

    deleteContextMenuAction = {
        label: 'Delete this input',
        icon: 'fa fa-times',
        command: (event) => this.deleteSelectedInput()
    }

    // Add remote download modal fields
    remoteUrl: string = "";
    remoteLocation: string = "";
    remoteName: string = "";
    remoteDescription: string = "";


    constructor(private jobsService: JobsService, private userStateService: UserStateService,
        private vglService: VglService, private modalService: NgbModal) {
        this.loadJobInputs();
    }


    /**
     * Add a JobDownload (dataset) or copied Job input to the Tree
     * 
     * @param jobDownload the JobDownload object
     */
    private addJobDownloadToTree(jobDownload: JobDownload) {
        const jobDownloadTreeNode: TreeNode = {
            data: {
                name: jobDownload.name,
                location: jobDownload.localPath,
                description: jobDownload.description,
                details: jobDownload.url,
                input: jobDownload,
                leaf: true
            }
        }
        this.rootRemoteWebServiceDownloads.children.push(jobDownloadTreeNode);
        this.rootRemoteWebServiceDownloads.expanded = true;

        // Add remote download root node to tree if it isn't already
        if (this.jobInputNodes.find(j => j.data.id === 'remote') === undefined) {
            this.rootRemoteWebServiceDownloads.expanded = true;
            this.jobInputNodes.push(this.rootRemoteWebServiceDownloads);
        }
    }


    /**
     * Add a CloudFileInformation object (copied from existing job) to the Tree
     * 
     * @param cloudFile CloudFileInformation file to add to tree
     */
    private addJobCloudFileToTree(cloudFile: CloudFileInformation) {
        const jobFileNode: TreeNode = {
            data: {
                name: cloudFile.name,
                location: 'Local directory',
                description: 'This file will be made available to the job upon startup. It will be put in the same working directory as the job script.',
                details: (cloudFile.size / 1000) + ' KB',
                input: cloudFile,
                leaf: true
            }
        }
        this.rootFileDownloads.children.push(jobFileNode);
        this.rootFileDownloads.expanded = true;

        // Add job file root node to tree if it isn't already
        if (this.jobInputNodes.find(j => j.data.id === 'upload') === undefined) {
            this.rootFileDownloads.expanded = true;
            this.jobInputNodes.push(this.rootFileDownloads);
        }
    }


    /**
     * Add a Job file upload to the Tree
     * 
     * @param file the file object to be added to the Tree
     */
    private addJobFileUploadToTree(file: any) {
        const jobFileNode: TreeNode = {
            data: {
                name: file.name,
                location: 'Local directory',
                description: 'This file will be made available to the job upon startup. It will be put in the same working directory as the job script.',
                details: (file.size / 1000) + ' KB',
                input: file,
                leaf: true
            }
        }
        this.rootFileDownloads.children.push(jobFileNode);
        this.rootFileDownloads.expanded = true;

        // Add job file root node to tree if it isn't already
        if (this.jobInputNodes.find(j => j.data.id === 'upload') === undefined) {
            this.rootFileDownloads.expanded = true;
            this.jobInputNodes.push(this.rootFileDownloads);
        }
    }


    /**
     * Load all Job inputs to the Tree
     */
    private loadJobInputs(): void {
        this.jobInputNodes = [];
        this.rootFileDownloads.children = [];
        this.rootRemoteWebServiceDownloads.children = [];

        // Retrieve job downloads
        this.userStateService.jobDownloads.subscribe(
            jobDownloads => {
                for (const download of jobDownloads) {
                    this.addJobDownloadToTree(download);
                }
            }, error => {
                // TODO: Better error reporting
                console.log(error.message);
            }
        );

        // Uploaded job files
        this.userStateService.uploadedFiles.subscribe(
            uploadedFiles => {
                for (const jobFile of uploadedFiles) {
                    this.addJobFileUploadToTree(jobFile);
                }
            }
        );

        // Job files copied from jobs
        const copiedJobFiles = this.userStateService.jobCloudFiles.subscribe(
            jobCloudFiles => {
                for (const jobFile of jobCloudFiles) {
                    this.addJobCloudFileToTree(jobFile);
                }
            }
        );
    }


    /**
     * Input node selected in Tree, builds context menu based on selection
     * 
     * @param event the selection event, intended to clear the existing
     *              context selection but not working
     */
    public jobInputSelected(event) {
        this.selectedContextNode = event.node;
    }


    /**
     * Context menu event fired. Select the node the event was fired from and
     * build context menu based on input
     * 
     * @param event the context menu event used to get the appropriate node
     */
    public contextMenuSelected(event) {
        // Make sure this acts as a node selection event as well
        this.selectedJobInputNode = event.node;

        // Build context menu
        this.jobInputContextMenuItems = [];
        // All items except files user has uploaded can be downloaded
        if (this.selectedJobInputNode.parent.data.id === 'remote' ||
            (this.selectedJobInputNode.data.leaf && this.selectedJobInputNode.data.input.hasOwnProperty('jobId'))) {
            this.jobInputContextMenuItems.push(this.downloadContextMenuAction);
        }
        // All items can deleted regardless of type
        this.jobInputContextMenuItems.push(this.deleteContextMenuAction);
    }


    /**
     * Download the selected Job input to the user's local machine
     */
    private downloadSelectedInput(): void {
        if (this.selectedJobInputNode.parent.data.id === 'upload') {
            // TODO: Single file downloads assumed to be text by VglService response type... OK?
            this.vglService.downloadFile(this.selectedJobInputNode.data.input.jobId, this.selectedJobInputNode.data.input.name, this.selectedJobInputNode.data.input.name).subscribe(
                response => {
                    saveAs(response, this.selectedJobInputNode.data.input.name);
                }, error => {
                    //TODO: Proper error reporting
                    console.log(error.message);
                }
            );
        } else if (this.selectedJobInputNode.parent.data.id === 'remote') {
            window.open(this.selectedJobInputNode.data.input.url);
        }
    }


    /**
     * Delete the selected input from the Tree and the UserStateService
     * (uploads, datasets and copied cloud files)
     */
    private deleteSelectedInput(): void {
        if (this.selectedJobInputNode.parent.data.id === 'upload') {
            if (this.selectedJobInputNode.data.input.hasOwnProperty('cloudKey')) {
                this.userStateService.removeCloudFile(this.selectedJobInputNode.data.input);
            } else {
                this.userStateService.removeUploadedFile(this.selectedJobInputNode.data.input);
            }
        } else if (this.selectedJobInputNode.parent.data.id === 'remote') {
            this.userStateService.removeJobDownload(this.selectedJobInputNode.data.input);
        }
        this.loadJobInputs();
    }


    /**
     * Copy inputs from an existing Job. Inputs will be JobDownloads (datasets)
     * or CloudFileInformation (copied job files)
     */
    public copyFromJob(): void {
        this.jobsService.getTreeJobs().subscribe(
            treeJobs => {
                const modalRef = this.modalService.open(JobInputsBrowserModalContent, { size: 'lg' });
                modalRef.result.then((result) => {
                    for (let download of result.jobDownloads) {
                        this.userStateService.addJobDownload(download);
                    }
                    for (let cloudFile of result.jobCloudFiles) {
                        cloudFile.jobId = result.jobId;
                        this.userStateService.addCloudFile(cloudFile);
                    }
                    // TODO: Can probably just add new ones instead of full reload,
                    // but will help keep in sync until better logic is added
                    this.loadJobInputs();
                });
            },
            error => {
                // TODO: Proper error reporting
                console.log(error.message);
            }
        )
    }


    /**
     * Add remote download. Displays dialog, on "OK" will create and add a
     * remote download to the data selection service (local storage)
     * 
     * @param content the add remote download modal, defined in HTML
     */
    public showAddRemoteDownloadDialog(content): void {
        this.modalService.open(content).result.then((result) => {
            if (result === 'OK click') {
                const jobDownload: JobDownload = {
                    name: this.remoteName,
                    description: this.remoteDescription,
                    url: this.remoteUrl,
                    localPath: this.remoteLocation,
                    northBoundLatitude: -1,
                    southBoundLatitude: -1,
                    eastBoundLongitude: -1,
                    westBoundLongitude: -1,
                    owner: '',
                    parentUrl: '',
                    parentName: '',
                    parent: undefined   // No Job associated with this download at this stage
                }
                this.addJobDownloadToTree(jobDownload);
                this.userStateService.addJobDownload(jobDownload);
                this.loadJobInputs();
            }
        });
    }


    /**
     * Upload a file. Will be stored locally and persisted in UserStateService
     * for actual upload to server when Job is created
     * 
     * @param event the upload event, will contain the file
     */
    public uploadFile(event): void {
        for (let file of event.target.files) {
            // Add to tree
            this.addJobFileUploadToTree(file);
            // Store
            this.userStateService.addUploadedFile(file);
        }
        if (!this.jobInputNodes.find(node => node === this.rootFileDownloads)) {
            this.jobInputNodes.push(this.rootFileDownloads);
        }
        this.loadJobInputs();
    }

}