import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TreeJobNode, TreeJobs, Job } from "../../shared/modules/vgl/models";
import { JobsService } from "./jobs.service";
import { JobStatusModalContent } from "./job-status.modal.component";
import { ConfirmationService, TreeNode } from "primeng/api";
import { Subscription } from "rxjs";


@Component({
    selector: 'job-browser',
    templateUrl: './job-browser.component.html',
    styleUrls: ['./job-browser.component.scss']
})


export class JobBrowserComponent implements OnInit {
    // Selection mode
    @Input() public selectionMode: string = "multiple";

    // Display a context menu when meta key pressed?
    @Input() public showContextMenu: boolean = false;

    // Job selection change event
    @Output() jobSelectionChanged = new EventEmitter();

    // HttpCLient request (for cancelling)
    httpSubscription: Subscription;

    // Job tree
    treeJobsData: TreeNode[] = [];
    selectedJobNodes: TreeNode[] = [];
    jobContextMenuItems = [];

    // Jobs
    jobs: Job[] = [];
    selectedJob: Job;

    // Flag for job loading in progress
    jobsLoading: boolean = false;

    // Job context menu actions
    cancelJobAction = { label: 'Cancel', icon: 'fa-times', command: (event) => this.cancelSelectedJob() };
    duplicateJobAction = { label: 'Duplicate', icon: 'fa-edit', command: (event) => this.duplicateSelectedJob() };
    deleteJobAction = { label: 'Delete', icon: 'fa-trash', command: (event) => this.deleteSelectedJobsAndFolders() };
    submitJobAction = { label: 'Submit', icon: 'fa-share-square', command: (event) => this.submitSelectedJob() };
    editJobAction = { label: 'Edit', icon: 'fa-edit', command: (event) => this.editSelectedJob() };


    constructor(private jobsService: JobsService, private confirmationService: ConfirmationService, private modalService: NgbModal) { }


    ngOnInit() {
        this.refreshJobs();
    }


    /**
     * Convert a VGL TreeNode to an p-treetable TreeNode
     * 
     * @param treeNode the TreeNode to convert to an p-treetable TreeNode
     */
    private createJobTreeNode(treeNode: TreeJobNode): TreeNode {
        let node: TreeNode = {};
        node.data = {
            "id": treeNode.id,              // Jobs only
            "seriesId": treeNode.seriesId,  // Series only
            "name": treeNode.name,
            "submitDate": treeNode.submitDate,
            "status": treeNode.status,
            "leaf": treeNode.leaf
        }
        if (treeNode.hasOwnProperty('children') && treeNode.children.length > 0) {
            node.children = [];
            for (let treeNodeChild of treeNode.children) {
                node.children.push(this.createJobTreeNode(treeNodeChild));
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
    private createJobsTreeNodes(treeJobs: TreeJobs): TreeNode[] {
        let treeData: TreeNode[] = [];
        // Skip root node (user name)
        let rootNode: TreeJobNode = treeJobs.nodes;
        if (rootNode.hasOwnProperty('children') && rootNode.children.length > 0) {
            for (let treeNodeChild of rootNode.children) {
                treeData.push(this.createJobTreeNode(treeNodeChild));
            }
        }
        return treeData;
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
     * Reload user jobs (Refresh button)
     */
    refreshJobs() {
        this.cancelCurrentSubscription();
        this.jobsLoading = true;
        this.httpSubscription = this.jobsService.getTreeJobs().subscribe(
            treeJobs => {
                this.treeJobsData = this.createJobsTreeNodes(treeJobs);
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
     * Build the job context menu based on job status
     */
    public createJobContextMenu(node): any[] {
        let items: any[] = [];
        // If more than 1 item is selected, or only a series is selected, delete is only action
        if (this.selectedJobNodes.length > 1 || !node.data.leaf) {
            items.push({ label: 'Delete', icon: 'fa-trash', command: (event) => this.deleteSelectedJobsAndFolders() });
        }
        // Otherwise available actions are specific to job status
        else if (this.selectedJobNodes.length === 1 && node.data.leaf) {
            const selectedJob: Job = this.jobs.find(j => j.id === this.selectedJobNodes[0].data.id);
            if (selectedJob.status.toLowerCase() === 'active') {
                items.push({ label: 'Cancel', icon: 'fa-cross', command: (event) => this.cancelSelectedJob() });
                items.push({ label: 'Duplicate', icon: 'fa-edit', command: (event) => this.duplicateSelectedJob() });
                // TODO: Confirm on active jobs
                items.push({ label: 'Status', icon: 'fa-info-circle', command: (event) => this.showSelectedJobStatus() });
            } else if (selectedJob.status.toLowerCase() === 'saved') {
                items.push({ label: 'Delete', icon: 'fa-trash', command: (event) => this.deleteSelectedJobsAndFolders() });
                items.push({ label: 'Submit', icon: 'fa-share-square', command: (event) => this.submitSelectedJob() });
                items.push({ label: 'Edit', icon: 'fa-edit', command: (event) => this.editSelectedJob() });
                items.push({ label: 'Status', icon: 'fa-info-circle', command: (event) => this.showSelectedJobStatus() });
            } else if (selectedJob.status.toLowerCase() === 'done' || selectedJob.status.toLowerCase() === 'error') {
                items.push({ label: 'Delete', icon: 'fa-trash', command: (event) => this.deleteSelectedJobsAndFolders() });
                items.push({ label: 'Duplicate', icon: 'fa-edit', command: (event) => this.duplicateSelectedJob() });
                items.push({ label: 'Status', icon: 'fa-info-circle', command: (event) => this.showSelectedJobStatus() });
            } else {
                items.push({ label: 'Cancel', icon: 'fa-cross', command: (event) => this.cancelSelectedJob() });
                items.push({ label: 'Duplicate', icon: 'fa-edit', command: (event) => this.duplicateSelectedJob() });
            }
        }
        return items;
    }


    /**
     * Job has been selected, fire selection event
     * @param event 
     */
    public jobSelected(event) {
        this.cancelCurrentSubscription();
        if (event.node && event.node.data.leaf) {
            this.selectedJob = this.jobs.find(j => j.id === event.node.data.id);
            this.jobSelectionChanged.emit(event);
        }
        // Folder selected
        else if (event.node && !event.node.data.leaf) {
            // TODO: Do we need ot do anything with folders?
            //console.log("Folder selected");
        }
        if (this.showContextMenu) {
            this.jobContextMenuItems = this.createJobContextMenu(event.node);
        }
    }


    /*
     * TODO: If the following job actions will behave similarly in other
     * classes (e.g. same dialog confirmations), move that code to job service
     */

    /**
     * Delete selected job (job context menu)
     */
    public deleteSelectedJobsAndFolders(): void {
        // Deleting job, series, or multiple jobs and/or series?
        let confirmTitle = '';
        let confirmMessage: string = '';
        if (this.selectedJobNodes.length === 1 && !this.selectedJobNodes[0].data.leaf) {
            confirmTitle = 'Delete Series';
            confirmMessage = 'Are you sure you want to delete the folder <strong>' + this.selectedJobNodes[0].data.name + '</strong> and its jobs?';
        } else if (this.selectedJobNodes.length === 1 && this.selectedJobNodes[0].data.leaf) {
            confirmTitle = 'Delete Job';
            confirmMessage = 'Are you sure you want to delete the job <strong>' + this.selectedJobNodes[0].data.name + ' </strong>?';
        } else if (this.selectedJobNodes.length > 1) {
            confirmTitle = 'Delete Jobs';
            confirmMessage = 'Are you sure you want to delete all selected jobs and folders?';
        } else {
            return;
        }
        // Confirm and delete
        this.confirmationService.confirm({
            header: confirmTitle,
            message: confirmMessage,
            icon: 'fa fa-trash',
            accept: () => {
                //for(let node of this.selectedJobNodes) {
                for (let i = 0; i < this.selectedJobNodes.length; i++) {
                    // Job
                    const node: TreeNode = this.selectedJobNodes[i];
                    if (node.data.leaf) {
                        this.jobsService.deleteJob(node.data.id).subscribe(
                            response => {
                                if (i === this.selectedJobNodes.length - 1) {
                                    this.refreshJobs();
                                    // TODO: Success message
                                }
                            },
                            error => {
                                // TODO: Proper error reporting
                                console.log(error.message);
                            }
                        )
                    }
                    // Series
                    else if (!node.data.leaf) {
                        this.jobsService.deleteSeries(node.data.seriesId).subscribe(
                            response => {
                                if (i === this.selectedJobNodes.length - 1) {
                                    this.refreshJobs();
                                    // TODO: Success message
                                }
                            },
                            error => {
                                // TODO: Proper error reporting
                                console.log(error.message);
                            }
                        )
                    }
                }
            }
        });
    }


    /**
     * Cancel the selected job (job context menu)
     */
    public cancelSelectedJob(): void {
        if (this.selectedJob) {
            const message = 'Are you sure want to cancel the job <strong>' + this.selectedJob.name + '</strong>';
            this.confirmationService.confirm({
                message: message,
                header: 'Cancel Job',
                icon: 'fa fa-times',
                accept: () => {
                    this.jobsService.cancelJob(this.selectedJob.id).subscribe(
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
     * 
     * TODO: Do. This will replicate a lot of submission functionality, so delaying
     */
    public duplicateSelectedJob(): void {

    }


    /**
     * Get the status of the selected job (job context menu)
     */
    public showSelectedJobStatus(): void {
        this.httpSubscription = this.jobsService.getAuditLogs(this.selectedJob.id).subscribe(
            auditLogs => {
                const modelRef = this.modalService.open(JobStatusModalContent);
                modelRef.componentInstance.job = this.selectedJob;
                modelRef.componentInstance.logs = auditLogs;
            },
            // TODO: Proper error reporting
            error => {
                console.log("Error: " + error.message);
            }
        );
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

}