import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ElementRef, ViewChild, Renderer } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TreeJobNode, TreeJobs, Job } from "../../shared/modules/vgl/models";
import { JobsService } from "./jobs.service";
import { JobStatusModalContent } from "./job-status.modal.component";
import { ConfirmationService, TreeNode } from "primeng/api";
import { Subscription } from "rxjs";
import { TimerObservable } from "rxjs/observable/TimerObservable";

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
    private timerSubscription: Subscription;
    private statusSubscription: Subscription;

    // Job tree, columns, selection and context items
    treeJobsData: TreeNode[] = [];
    treeCols: any[] = [
        { field: 'name', header: 'Name', colStyle: { 'width': '40%' } },
        { field: 'submitDate', header: 'Submit Date', colStyle: { 'width': '40%' } },
        { field: 'status', header: 'Status', colStyle: { 'width': '20%' } }
    ];
    selectedJobNodes: TreeNode[] = [];
    jobContextMenuItems = [];
    selectedContextNode: TreeNode;

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


    constructor(private jobsService: JobsService, private confirmationService: ConfirmationService, private modalService: NgbModal, public renderer: Renderer) { }


    ngOnInit() {
        this.refreshJobs();
        let timer = TimerObservable.create(0, 60000);
        this.timerSubscription = timer.subscribe(timer => {
            this.refreshJobStatus();
        })
    }

    ngOnDestroy() {
        this.timerSubscription.unsubscribe();
    }

    /**
     *
     */
    public getSelectedJob(): Job {
        return this.selectedJob;
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
            "leaf": treeNode.leaf,
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
     * Reload user jobs 
     */
    refreshJobs() {
        this.cancelCurrentSubscription();
        this.jobsLoading = true;
        this.selectedJob = null;
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
     * Refresh Jobs Status (Refresh button)
     */
    refreshJobStatus() {
        this.statusSubscription = this.jobsService.getJobStatuses().subscribe(statusUpdates => {
            for (var key in statusUpdates) {
                let jobNode: TreeNode = this.treeJobsData.find(node => node.data.id === statusUpdates[key].jobId);
                if (jobNode)
                    jobNode.data.status = statusUpdates[key].status;
            }
        });
    }

    /**
     * Build the job context menu based on job status
     */
    public createJobContextMenu(node): any[] {
        let items: any[] = [];
        // If more than 1 item is selected, or only a series is selected, delete is only action
        if (this.selectedJobNodes.length > 1 || !node.data.leaf) {
            items.push({ label: 'Delete', icon: 'fa fa-trash', command: (event) => this.deleteSelectedJobsAndFolders() });
        }
        // Otherwise available actions are specific to job status
        else if (this.selectedJobNodes.length === 1 && node.data.leaf) {
            const selectedJob: Job = this.jobs.find(j => j.id === this.selectedJobNodes[0].data.id);
            if (selectedJob.status.toLowerCase() === 'active') {
                items.push({ label: 'Cancel', icon: 'fa fa-cross', command: (event) => this.cancelSelectedJob() });
                items.push({ label: 'Duplicate', icon: 'fa fa-edit', command: (event) => this.duplicateSelectedJob() });
                // TODO: Confirm on active jobs
                items.push({ label: 'Status', icon: 'fa fa-info-circle', command: (event) => this.showSelectedJobStatus() });
            } else if (selectedJob.status.toLowerCase() === 'saved') {
                items.push({ label: 'Delete', icon: 'fa fa-trash', command: (event) => this.deleteSelectedJobsAndFolders() });
                items.push({ label: 'Submit', icon: 'fa fa-share-square', command: (event) => this.submitSelectedJob() });
                items.push({ label: 'Edit', icon: 'fa fa-edit', command: (event) => this.editSelectedJob() });
                items.push({ label: 'Status', icon: 'fa fa-info-circle', command: (event) => this.showSelectedJobStatus() });
            } else if (selectedJob.status.toLowerCase() === 'done' || selectedJob.status.toLowerCase() === 'error') {
                items.push({ label: 'Delete', icon: 'fa fa-trash', command: (event) => this.deleteSelectedJobsAndFolders() });
                items.push({ label: 'Duplicate', icon: 'fa fa-edit', command: (event) => this.duplicateSelectedJob() });
                items.push({ label: 'Status', icon: 'fa fa-info-circle', command: (event) => this.showSelectedJobStatus() });
            } else {
                items.push({ label: 'Cancel', icon: 'fa fa-cross', command: (event) => this.cancelSelectedJob() });
                items.push({ label: 'Duplicate', icon: 'fa fa-edit', command: (event) => this.duplicateSelectedJob() });
            }
        }
        return items;
    }


    /**
     * Handle the context menu selection. Will add selection to the job
     * selection list and call the job selection method so the correct
     * context menu can be constructed
     *
     * @param event job tree node context menu was called from
     */
    public contextMenuSelected(event) {
        if (this.selectedJobNodes.indexOf(event.node) === -1) {
            this.selectedJobNodes.push(event.node);
        }
        this.jobSelected(event);
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
                for (let node of this.selectedJobNodes) {
                    if (node.data.leaf) {
                        this.cancelCurrentSubscription();

                        this.jobsService.deleteJob(node.data.id).subscribe(
                            response => {
                                let index = this.treeJobsData.findIndex(row => row.data.id === node.data.id);
                                //delete from the tree
                                this.deleteNode(index);
                                // TODO: Success message
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
                                let index = this.treeJobsData.findIndex(row => row.data.seriesId === node.data.seriesId);
                                //delete from the tree
                                this.deleteNode(index);
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
     * delete a node from the TreeNode[] using index
     * @param index 
     */
    deleteNode(index: number) {
        if (index > -1) {
            this.treeJobsData.splice(index, 1);
            this.treeJobsData = [...this.treeJobsData];
        }
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
      if (this.selectedJob) {
        const message = 'Are you sure want to submit the job <strong>' + this.selectedJob.name + '</strong>';
        this.confirmationService.confirm({
          message: message,
          header: 'Submit Job',
          icon: 'fa fa-times',
          accept: () => {
            this.jobsService.submitJob(this.selectedJob).subscribe(
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
     * Edit selected job (job context menu)
     */

    public editSelectedJob(): void {

    }

    /**
     * drop selected nodes from old position to a new folder.
     * @param node 
     */
    drop(node: any) {
        if (this.selectedJobNodes.length > 0) {
            var jobIds: number[] = [];
            //get the list of jobs ids to be moved
            this.selectedJobNodes.map(node => {
                if (node.data.id)
                    jobIds.push(node.data.id);
            });
            //get the new location series id
            let newFolder: TreeNode = this.treeJobsData.find(nodeElement => nodeElement.data.seriesId === node.data.seriesId);
            if (newFolder.data.seriesId) {
                //make the dragged jobs series id to be the new folder id
                this.jobsService.setJobFolder(jobIds, newFolder.data.seriesId).subscribe(
                    data => {
                        //make the front end node changes for shiftig from old folder to new folder.
                        this.selectedJobNodes.forEach(shiftingNode => {
                            if (shiftingNode.data.id)
                                this.moveFolder(newFolder, shiftingNode);
                        });
                    },
                    // TODO: Proper error reporting
                    error => {
                        console.log(error.message);
                    }

                );
            }
        }
    }

    /**
     * Move a node to new folder by deleting from existing location
     */   
    moveFolder(newFolder: TreeNode, jobNode: TreeNode) {
        //if the node is inside a folder
        if (jobNode.parent) {
            let oldFolder: TreeNode = this.treeJobsData.find(nodeElement => nodeElement.data.seriesId === jobNode.parent.data.seriesId);
            if (oldFolder.children) {
                let shiftingNodeIndex = oldFolder.children.findIndex(childNode => childNode.data.id === jobNode.data.id);
                //delete from old folder
                if (shiftingNodeIndex > -1) {
                    oldFolder.children.splice(shiftingNodeIndex, 1);
                    //add to the new folder
                    this.addToNewFolder(newFolder, jobNode);
                }
            }
        }
        else {
            //if the node is not inside a folder, it in the main tree
            let shiftingNodeIndex = this.treeJobsData.findIndex(row => row.data.id === jobNode.data.id);
            //delete from the main tree and and add to new folder
            if (shiftingNodeIndex > -1) {
                this.treeJobsData.splice(shiftingNodeIndex, 1);
                //add to the new folder
                this.addToNewFolder(newFolder, jobNode);
            }
        }
        newFolder.expanded = true;
    }

    /**
     * add a node to a new folder
     * @param newFolder 
     * @param jobNode 
     */
    addToNewFolder(newFolder: TreeNode, jobNode: TreeNode) {
        //add to the new folder
        jobNode.parent = newFolder;
        jobNode.data.seriesId = newFolder.data.seriesId;
        if (newFolder.children)
            newFolder.children.push(jobNode);
        else {
            newFolder.children = [];
            newFolder.children.push(jobNode);
        }
        this.treeJobsData = [...this.treeJobsData];
    }

    /**
     * Drag over event
     * @param event 
     */
    allowDrop(event) {
        event.preventDefault();
    }

    /**
     * Prepare a node for dragging if it is a job node. 
     * When user drags a unselected node,make it selected and unselecting other selected rows.
     * @param node 
     */
    handleDragstart(node: any) {
        if (node && node.data.leaf) {
            let index = this.selectedJobNodes.findIndex(elem => elem.data.id === node.data.id)
            //row chosen not present in selected nodes, so unselect other selected nodes and make this row selected.
            if (index === -1) {                
                this.selectedJobNodes.splice(0, this.selectedJobNodes.length);
                this.selectedJobNodes.push(node);
                this.selectedJob = this.jobs.find(j => j.id === node.data.id);
                this.jobSelectionChanged.emit(event);
            }

        }
    }
}
