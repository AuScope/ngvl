import { Component } from '@angular/core';
import { TreeJobs, TreeJobNode, JobDownload, JobFile, CloudFileInformation } from '../../../shared/modules/vgl/models';
import { DataSelectionService, UserStateService } from '../../../shared';
import { JobInputsBrowserModalContent } from './job-inputs-browser.modal.component';
import { TreeNode } from 'primeng/api';
import { JobsService } from '../jobs.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { saveAs } from 'file-saver';


@Component({
    selector: 'job-submission-datasets',
    templateUrl: './job-submission-datasets.component.html',
    styleUrls: ['./job-submission-datasets.component.scss']
})


export class JobSubmissionDatasetsComponent {

    // Job input file tree (input type root nodes added to this)
    jobInputNodes: TreeNode[];
    treeCols = [
        { header: 'Name', field: 'name', colStyle: {'width': '20%'} },
        { header: 'Location', field: 'location', colStyle: {'width': '20%'} },
        { header: 'Description', field: 'description', colStyle: {'width': '30%'} },
        { header: 'Details', field: 'details', colStyle: {'width': '30%'} }
    ];

    // Selected input (single selection)
    selectedJobInputNode: any;

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

    // Files user has selected for upload, copied from UserStateService
    uploadedFiles: any[] = [];

    // Job download context menu
    jobInputContextMenuItems = [{
        label: 'Download to your machine',
        icon: 'fa fa-download',
        command: (event) => this.downloadSelectedInput()
    }, {
        label: 'Delete this input',
        icon: 'fa fa-times',
        command: (event) => this.deleteSelectedInput()
    }];

    // Add remote download modal fields
    remoteUrl: string = "";
    remoteLocation: string = "";
    remoteName: string = "";
    remoteDescription: string = "";


    constructor(private jobsService: JobsService, private userStateService: UserStateService,
        private dataSelectionService: DataSelectionService, private modalService: NgbModal) {
        this.loadJobInputs();
    }


    /**
     * Add a JobDownload (dataset) or copied Job input to the Tree
     * 
     * @param jobDownload the JobDOwnload object
     * @param copiedJobId true if input was copied from an existing job, false otherwise
     */
    private addJobDownloadToTree(jobDownload: JobDownload, isCopied: boolean) {
        const jobDownloadTreeNode: TreeNode = {
            data: {
                name: jobDownload.name,
                location: jobDownload.localPath,
                description: jobDownload.description,
                details: jobDownload.url,
                input: jobDownload,
                isCopied: isCopied,
                leaf: true
            }
        }
        this.rootRemoteWebServiceDownloads.children.push(jobDownloadTreeNode);
        this.rootRemoteWebServiceDownloads.expanded = true;
    }


    /**
     * Add a CloudFileInformation object (copied job file) to the Tree
     * 
     * @param cloudFile CloudFileInformation file to add to tree
     * @param jobId: the associated Job ID
     */
    private addJobCloudFileToTree(jobFile: CloudFileInformation, jobId: number) {
        const jobFileNode: TreeNode = {
            data: {
                name: jobFile.name,
                location: 'Local directory',
                description: 'This file will be made available to the job upon startup. It will be put in the same working directory as the job script.',
                details: (jobFile.size / 1000) + ' KB',
                input: jobFile,
                jobId: jobId,
                isCopied: true,
                leaf: true
            }
        }
        this.rootFileDownloads.children.push(jobFileNode);
        this.rootFileDownloads.expanded = true;
    }


    /**
     * Add a Job file upload to the Tree. Will be stored locally and in USerStateService
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

                // TODO: Still use this
                input: file,

                leaf: true
            }
        }
        this.rootFileDownloads.children.push(jobFileNode);
        this.rootFileDownloads.expanded = true;
    }


    /**
     * Load all Job inputs to the Tree
     */
    private loadJobInputs(): void {
        this.jobInputNodes = [];
        this.rootFileDownloads.children = [];
        this.rootRemoteWebServiceDownloads.children = [];

        // Job downloads from data selection service (local storage)
        let jobDownloads: JobDownload[] = this.dataSelectionService.getJobDownloads();
        for (const download of jobDownloads) {
            this.addJobDownloadToTree(download, false);
        }

        // Job downloads copied from existing jobs
        const copiedJobDownloads = this.dataSelectionService.getCopiedJobDownloads();
        for (const download of copiedJobDownloads) {
            this.addJobDownloadToTree(download, true);
        }

        // Uploaded job files (temporarily stored in UserStateService)
        this.userStateService.uploadedFiles.subscribe(
            uploadedFiles => {
                this.uploadedFiles = uploadedFiles;
            }
        );
        for (const jobFile of this.uploadedFiles) {
            this.addJobFileUploadToTree(jobFile);
        }

        // Job files copied from jobs
        const copiedJobFiles = this.dataSelectionService.getJobCloudFiles();
        const jobId: number = copiedJobFiles.copiedJobId;
        if(copiedJobFiles.hasOwnProperty('copiedJobFiles')) {
            const cloudFiles: CloudFileInformation[] = copiedJobFiles.copiedJobFiles;
            for (const jobFile of cloudFiles) {
                this.addJobCloudFileToTree(jobFile, jobId);
            }
        }

        // Add root download node if any were added
        if (this.rootRemoteWebServiceDownloads.children.length > 0) {
            this.rootRemoteWebServiceDownloads.expanded = true;
            this.jobInputNodes.push(this.rootRemoteWebServiceDownloads);
        }

        // Add root file node if any were added
        if (this.rootFileDownloads.children.length > 0) {
            this.rootFileDownloads.expanded = true;
            this.jobInputNodes.push(this.rootFileDownloads);
        }
    }


    /**
     * Download the selected Job input to the user's local machine
     */
    private downloadSelectedInput(): void {
        if (this.selectedJobInputNode.parent.data.id === 'upload') {
            // TODO: Don't show download menu if the input has been uploaded
            if (this.selectedJobInputNode.data.isCopied) {
                this.jobsService.downloadFile(this.selectedJobInputNode.data.jobId, this.selectedJobInputNode.data.name, this.selectedJobInputNode.data.name).subscribe(
                    response => {
                        saveAs(response, this.selectedJobInputNode.data.name);
                    },
                    error => {
                        //TODO: Proper error reporting
                        console.log(error.message);
                    }
                )
            }
        } else if (this.selectedJobInputNode.parent.data.id === 'remote') {
            window.open(this.selectedJobInputNode.data.input.url);
        }
    }


    /**
     * Delete the selected input from the Tree and either the UserStateService
     * (uploads) or DataSelectionService (datasets and copied cloud files)
     */
    private deleteSelectedInput(): void {
        if (this.selectedJobInputNode.parent.data.id === 'upload') {
            if (this.selectedJobInputNode.data.isCopied) {
                this.dataSelectionService.removeJobCloudFile(this.selectedJobInputNode.data.input);
            } else {
                //this.dataSelectionService.removeJobFile(this.selectedJobInputNode.data.input);
                const index: number = this.uploadedFiles.indexOf(this.selectedJobInputNode.data.input);
                if (index !== -1) {
                    this.uploadedFiles.splice(index, 1);
                    this.userStateService.setUploadedFiles(this.uploadedFiles);
                }
            }
        } else if (this.selectedJobInputNode.parent.data.id === 'remote') {
            if (this.selectedJobInputNode.data.isCopied) {
                this.dataSelectionService.removeCopiedJobDownload(this.selectedJobInputNode.data.input);
            } else {
                this.dataSelectionService.removeJobDownload(this.selectedJobInputNode.data.input);
            }
        }
        this.loadJobInputs();
    }


    /**
     * Copy inouts from an existing Job. Inputs will be JobDownloads (datasets)
     * or CloudFileInformation (copied job files)
     */
    public copyFromJob(): void {
        this.jobsService.getTreeJobs().subscribe(
            treeJobs => {
                const modalRef = this.modalService.open(JobInputsBrowserModalContent, { size: 'lg' });
                modalRef.result.then((result) => {
                    this.dataSelectionService.setCopiedJobDownloads(result.jobDownloads, result.jobId);
                    this.dataSelectionService.setJobCloudFiles(result.jobCloudFiles, result.jobId);
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

                    // TODO: XXX Effectively server session vars, do we need proper defaults or will these do?
                    //id: -1,
                    northBoundLatitude: -1,
                    southBoundLatitude: -1,
                    eastBoundLongitude: -1,
                    westBoundLongitude: -1,
                    owner: '',
                    parentUrl: '',
                    parentName: ''
                }
                this.addJobDownloadToTree(jobDownload, false);
                // Persist to local storage
                let downloads: JobDownload[] = this.dataSelectionService.getJobDownloads();
                downloads.push(jobDownload);
                this.dataSelectionService.setJobDownloads(downloads);
                this.loadJobInputs();
            }
        });
    }


    /**
     * Upload a file. Will be stored locally and persisted in UserStateService
     * for actual upload to server when Job is created
     */
    public uploadFile(event): void {
        for (let file of event.target.files) {
            // Add to tree
            this.addJobFileUploadToTree(file);
            // Add to local list of uploads and persist in UserStateService
            this.uploadedFiles.push(file);
            this.userStateService.setUploadedFiles(this.uploadedFiles);
        }
        if (!this.jobInputNodes.find(node => node === this.rootFileDownloads)) {
            this.jobInputNodes.push(this.rootFileDownloads);
        }
        this.loadJobInputs();
    }

}