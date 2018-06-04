import { Component } from '@angular/core';
import { TreeJobs, TreeJobNode, JobDownload, JobFile } from '../../../shared/modules/vgl/models';
import { DataSelectionService, UserStateService } from '../../../shared';
import { JobInputsBrowserModalContent } from './job-inputs-browser.modal.component';
import { TreeNode } from 'primeng/api';
import { JobsService } from '../jobs.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
    selector: 'job-submission-datasets',
    templateUrl: './job-submission-datasets.component.html',
    styleUrls: ['./job-submission-datasets.component.scss']
})


export class JobSubmissionDatasetsComponent {

    // Job input file tree
    jobInputNodes: TreeNode[];

    // Selected input
    selectedJobInputNode: any;

    // Root remote web service node
    rootRemoteWebServiceDownloads: TreeNode = {
        data: {
            name: "Remote Web Service Downloads",
            id: "remote",
            expanded: true,
            leaf: false
        },
        children: []
    }

    // Root files node
    rootFileDownloads: TreeNode = {
        data: {
            name: "Your Uploaded Files",
            id: "upload",
            expanded: true,
            leaf: false
        },
        children: []
    }

    // Files user has selected for upload
    jobFileUploads: any[] = [];

    // Job download context menu
    jobInputContextMenuItems = [{
        label: 'Download to your machine',
        icon: 'fa-download',
        command: (event) => this.downloadSelectedInput()
    }, {
        label: 'Delete this input',
        icon: 'fa-times',
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
     * 
     * @param jobDownload 
     * @param copiedJobId 
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
     * 
     * @param jobFile Job file to add to tree, will be either JobFile
     * (uploaded) or CloudFileInformation (copied)
     */
    private addJobFileToTree(jobFile: any, isCopied: boolean) {
        const jobFileNode: TreeNode = {
            data: {
                name: jobFile.name,
                location: 'Local directory',
                description: 'This file will be made available to the job upon startup. It will be put in the same working directory as the job script.',
                details: (jobFile.size / 1000) + ' KB',

                input: jobFile,
                isCopied: isCopied,
                
                leaf: true
            }
        }
        this.rootFileDownloads.children.push(jobFileNode);
        this.rootFileDownloads.expanded = true;
    }


    /**
     * 
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

        // Uploaded job files
        let jobFiles: JobFile[] = this.dataSelectionService.getJobFiles();
        for (const jobFile of jobFiles) {
            this.addJobFileToTree(jobFile, false);
        }

        // Job files copied from jobs
        const copiedJobFiles = this.dataSelectionService.getCopiedJobFiles();
        for (const jobFile of copiedJobFiles) {
            this.addJobFileToTree(jobFile, true);
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
     * 
     */
    private downloadSelectedInput(): void {
        if(this.selectedJobInputNode.parent.data.id==='upload') {
            console.log('Download File');
        } else if(this.selectedJobInputNode.parent.data.id==='remote') {
            console.log('Download Upload');
        }
    }


    /**
     * 
     */
    private deleteSelectedInput(): void {
        if(this.selectedJobInputNode.parent.data.id==='upload') {
            if(this.selectedJobInputNode.data.isCopied) {
                this.dataSelectionService.removeCopiedJobFile(this.selectedJobInputNode.data.input);
            } else {
                this.dataSelectionService.removeJobFile(this.selectedJobInputNode.data.input);
            }
        } else if(this.selectedJobInputNode.parent.data.id==='remote') {
            if(this.selectedJobInputNode.data.isCopied) {
                this.dataSelectionService.removeCopiedJobDownload(this.selectedJobInputNode.data.input);
            } else {
                this.dataSelectionService.removeJobDownload(this.selectedJobInputNode.data.input);
            }
        }
        this.loadJobInputs();
    }


    /**
     * 
     */
    public copyFromJob(): void {
        this.jobsService.getTreeJobs().subscribe(
            treeJobs => {
                const modalRef = this.modalService.open(JobInputsBrowserModalContent, { size: 'lg' });
                modalRef.result.then((result) => {
                    this.dataSelectionService.setCopiedJobDownloads(result.jobDownloads, result.jobId);
                    this.dataSelectionService.setCopiedJobFiles(result.jobCloudFiles, result.jobId);
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
            }
        });
    }


    /**
     * 
     */
    public uploadFile(event): void {
        for (let jobFile of event.target.files) {
            this.addJobFileToTree(jobFile, false);
        }
        if (!this.jobInputNodes.find(node => node === this.rootFileDownloads)) {
            this.jobInputNodes.push(this.rootFileDownloads);
        }
    }

}