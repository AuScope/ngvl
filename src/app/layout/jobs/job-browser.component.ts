import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TreeJobNode, TreeJobs, Job } from "../../shared/modules/vgl/models";
import { JobsService } from "./jobs.service";
import { JobStatusModalComponent } from "./job-status.modal.component";
import { ConfirmationService, TreeNode, SortEvent } from "primeng/api";
import { Subscription } from "rxjs";
import { TimerObservable } from "rxjs/observable/TimerObservable";
import { MessageService } from 'primeng/api';
import { TreeTable } from "primeng/treetable";


@Component({
    selector: 'app-job-browser',
    templateUrl: './job-browser.component.html',
    styleUrls: ['./job-browser.component.scss']
})


export class JobBrowserComponent implements OnInit, OnDestroy {
    // Selection mode
    @Input() public selectionMode: string = "multiple";

    // Display a context menu when meta key pressed?
    @Input() public showContextMenu: boolean = false;

    // Job selection change event
    @Output() jobSelectionChanged = new EventEmitter();

    @ViewChild('jobTreeTable')
    jobTreeTable: TreeTable;

    // HttpClient request (for cancelling)
    httpSubscription: Subscription;
    private timerSubscription: Subscription;

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
    cancelJobAction = { label: 'Cancel', icon: 'fa-times', command: () => this.cancelSelectedJob() };
    duplicateJobAction = { label: 'Duplicate', icon: 'fa-edit', command: () => this.duplicateSelectedJob() };
    deleteJobAction = { label: 'Delete', icon: 'fa-trash', command: () => this.deleteSelectedJobsAndFolders() };
    submitJobAction = { label: 'Submit', icon: 'fa-share-square', command: () => this.submitSelectedJob() };
    editJobAction = { label: 'Edit', icon: 'fa-edit', command: () => this.editSelectedJob() };
    moveJobAction = { label: 'Move to Top Level', icon: 'fa fa-arrow-up', command: () => this.moveSelectedJob() };

    // Initial multiple sort meta, order by reverse submitDate
    multiSortMeta = [
        { field: 'submitDate', order: -1 }
    ];


    constructor(private jobsService: JobsService,
        private confirmationService: ConfirmationService,
        private modalService: NgbModal,
        private messageService: MessageService,
        private router: Router) { }


    ngOnInit() {
        this.refreshJobs();
        let timer = TimerObservable.create(0, 60000);
        this.timerSubscription = timer.subscribe(() => {
            this.refreshJobStatus();
        });
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
     * TreeTable has UI issues, ensure updates are displayed using the spread
     * operator (per documentation) after applying the sort function
     */
    updateJobTree() {
        let jobsData = this.sortTreeJobs(this.treeJobsData);
        this.treeJobsData = [...jobsData];
    }


    /**
     * Convert a VGL TreeNode to an p-treetable TreeNode
     *
     * @param treeNode the TreeNode to convert to an p-treetable TreeNode
     */
    private createJobTreeNode(treeNode: TreeJobNode): TreeNode {
        let node: TreeNode = {};
        node.leaf = treeNode.leaf;
        node.data = {
            "id": treeNode.id,              // Jobs only
            "seriesId": treeNode.seriesId,  // Series only
            "name": treeNode.name,
            "submitDate": treeNode.submitDate,
            "status": treeNode.status
        };
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
                this.messageService.add({ severity: 'error', summary: 'Error retrieving job status', detail: error.message, sticky: true });
            }
        );
    }

    /**
     * Refresh Jobs Status (Refresh button)
     */
    refreshJobStatus() {
        this.jobsService.getJobStatuses().subscribe(statusUpdates => {
            for (let key in statusUpdates) {
                let jobNode = this.findJobNode(statusUpdates[key].jobId);
                if (jobNode) {
                    jobNode.data.status = statusUpdates[key].status;
                    if (this.selectedJob && (this.selectedJob.id === jobNode.data.id)) {
                        this.selectedJob.status = jobNode.data.status;
                    }
                }
            }
        });
    }

    /**
     * find a node for a given job id in this.treeJobsData
     * @param jobId
     */
    findJobNode(jobId: number): TreeNode {
        let node: TreeNode;
        for (let index = 0; index < this.treeJobsData.length; index++) {
            node = this.treeJobsData[index];
            // Job not in a folder
            if ((node.data.id) && (node.data.id === jobId)) {
                return node;
            }
            // Job may be present inside a folder
            if (node.children) {
                for (let pos = 0; pos < node.children.length; pos++) {
                    if ((node.children[pos].data.id) && (node.children[pos].data.id === jobId)) {
                        return node.children[pos];
                    }

                }
            }
        }
    }

    /**
     * Test if a specified TreeNode has a parent
     *
     * @param node the TreeNode to test
     * @return true if TreeNode has a parent, false otherwise
     */
    private nodeHasParent(node: TreeNode): boolean {
        for (let treeJob of this.treeJobsData) {
            if (treeJob.children && treeJob.children.findIndex(n => n === node) > -1) {
                return true;
            }
        }
        return false;
    }

    /**
     * Build the job context menu based on job status
     */
    public createJobContextMenu(node): any[] {
        let items: any[] = [];
        // one or more job nodes are selected to move to top level
        if (this.selectedJobNodes.length === 1 && (this.nodeHasParent(node))) {
            items.push({ label: 'Move to Top Level', icon: 'fa fa-arrow-up', command: () => this.moveSelectedJob() });
        }
        // If more than 1 item is selected, or only a series is selected, delete is only action
        if (this.selectedJobNodes.length > 1 || !node.leaf) {
            items.push({ label: 'Delete', icon: 'fa fa-trash', command: () => this.deleteSelectedJobsAndFolders() });

        // Otherwise available actions are specific to job status
        } else if (this.selectedJobNodes.length === 1 && node.leaf) {
            const selectedJob: Job = this.jobs.find(j => j.id === this.selectedJobNodes[0].data.id);
            if (selectedJob.status.toLowerCase() === 'active') {
                items.push({ label: 'Cancel', icon: 'fa fa-cross', command: () => this.cancelSelectedJob() });
                // items.push({ label: 'Duplicate', icon: 'fa fa-edit', command: (event) => this.duplicateSelectedJob() });
                // TODO: Confirm on active jobs
                items.push({ label: 'Status', icon: 'fa fa-info-circle', command: () => this.showSelectedJobStatus() });
            } else if (selectedJob.status.toLowerCase() === 'saved') {
                items.push({ label: 'Delete', icon: 'fa fa-trash', command: () => this.deleteSelectedJobsAndFolders() });
                items.push({ label: 'Submit', icon: 'fa fa-share-square', command: () => this.submitSelectedJob() });
                items.push({ label: 'Edit', icon: 'fa fa-edit', command: () => this.editSelectedJob() });
                items.push({ label: 'Status', icon: 'fa fa-info-circle', command: () => this.showSelectedJobStatus() });
            } else if (selectedJob.status.toLowerCase() === 'done' || selectedJob.status.toLowerCase() === 'error') {
                items.push({ label: 'Delete', icon: 'fa fa-trash', command: () => this.deleteSelectedJobsAndFolders() });
                // items.push({ label: 'Duplicate', icon: 'fa fa-edit', command: (event) => this.duplicateSelectedJob() });
                items.push({ label: 'Status', icon: 'fa fa-info-circle', command: () => this.showSelectedJobStatus() });
            } else {
                items.push({ label: 'Cancel', icon: 'fa fa-cross', command: () => this.cancelSelectedJob() });
                // items.push({ label: 'Duplicate', icon: 'fa fa-edit', command: (event) => this.duplicateSelectedJob() });
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
            // Add to or replace selections depending on whether CTRL key was held down
            if (event.originalEvent.ctrlKey) {
                this.selectedJobNodes.push(event.node);
            } else {
                this.selectedJobNodes = [event.node];
            }
        }
        this.jobSelected(event, true);
    }


    /**
     * Job has been selected, fire selection event
     *
     * @param event the selection event
     * @param contextSelection if true, the selection was made as part of a
     * context menu press (right-click), whilst false (or not present)
     * indicates a standard left-click selection
     */
    public jobSelected(event, contextSelection?) {
        this.cancelCurrentSubscription();

        // Job selection has changed
        if (event.node && event.node.leaf) {
            this.selectedJob = this.jobs.find(j => j.id === event.node.data.id);
            this.jobSelectionChanged.emit(event);
        }

        // Display context menu if the option has been set
        if (this.showContextMenu) {
            this.jobContextMenuItems = this.createJobContextMenu(event.node);
        }

        // Fix to deselect context selection (if one was made) when user left-clicks
        if (!contextSelection && this.selectedContextNode) {
            this.selectedContextNode = undefined;
            this.updateJobTree();
        }
    }


    /**
     * Compare function for the TreeTable sort methods.
     *
     * @param node1 the first TreeNode to be compared
     * @param node2 the second TreeNode to be compared
     * @param multiSortMeta the multiSortMeta (from SortEvent or TreeTable)
     * used to determine sort criteria
     * @return -1 if the first result takes precedence, 0 if euqal, 1 if the
     * second result takes precendence
     */
    compareJobs(node1: TreeNode, node2: TreeNode, multiSortMeta: any[]): number {
        let result = null;
        for (let i = 0; i < multiSortMeta.length; i++) {
            let sortField = multiSortMeta[i].field;
            let sortOrder = multiSortMeta[i].order;
            let value1 = node1['data'][sortField];
            let value2 = node2['data'][sortField];
            result = 0;
            if (value1 == null && value2 != null) {
                result = -1;
            } else if (value1 != null && value2 == null) {
                result = 1;
            } else if (typeof value1 === 'string' && typeof value2 === 'string') {
                result = value1.localeCompare(value2);
            } else {
                result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
            }
            result = result * sortOrder;
            // If results aren't equal, we're done
            if (result !== 0) {
                break;
            }
            // If results are equal and this was the final comparison, use Job
            // or series ID for consistent ordering
            if (i === multiSortMeta.length - 1 && result === 0) {
                value1 = node1['data'].hasOwnProperty('id') && node1['data'].id ? node1['data'].id : node1['data'].seriesId;
                value2 = node2['data'].hasOwnProperty('id') && node2['data'].id ? node2['data'].id : node2['data'].seriesId;
                result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
            }
        }
        return result;
    }

    /**
     * Call tree sort manually, required for context menu bug where using the
     * spread operator to clear the highlighted context selection reorders the
     * TreeTable
     *
     * @param jobs TreeNodes to reorder
     */
    sortTreeJobs(jobs: TreeNode[]): TreeNode[] {
        jobs.sort((node1: TreeNode, node2: TreeNode) => {
            return this.compareJobs(node1, node2, this.jobTreeTable.multiSortMeta);
        });
        return jobs;
    }


    /**
     * Sort Tree based on multiSortMeta from the SortEvent when user clicks
     * table headers
     *
     * @param event SortEvent
     */
    customSort(event: SortEvent) {
        event.data.sort((data1, data2) => {
            return this.compareJobs(data1, data2, event.multiSortMeta);
        });
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
        if (this.selectedJobNodes.length === 1 && !this.selectedJobNodes[0].leaf) {
            confirmTitle = 'Delete Series';
            confirmMessage = 'Are you sure you want to delete the folder <strong>' + this.selectedJobNodes[0].data.name + '</strong> and its jobs?';
        } else if (this.selectedJobNodes.length === 1 && this.selectedJobNodes[0].leaf) {
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
                // this.cancelCurrentSubscription();
                for (let node of this.selectedJobNodes) {
                    if (node.leaf) {
                        this.jobsService.deleteJob(node.data.id).subscribe(
                            () => {
                                // Root Job, no Series
                                if (!node.parent) {
                                    this.treeJobsData = this.treeJobsData.filter(
                                        job => job.data.id !== node.data.id
                                    );

                                // Job part of series
                                } else {
                                    node.parent.children = node.parent.children.filter(
                                        job => job.data.id !== node.data.id
                                    );
                                }

                                // Remove from Jobs list
                                this.jobs = this.jobs.filter(
                                    job => job.id !== node.data.id
                                );
                            },
                            error => {
                                this.messageService.add({ severity: 'error', summary: 'Error deleting job(s)', detail: error.message, sticky: true });
                            }
                        );
                    // Series
                    } else if (!node.leaf) {
                        this.cancelCurrentSubscription();
                        this.jobsService.deleteSeries(node.data.seriesId).subscribe(
                            () => {
                                this.treeJobsData = this.treeJobsData.filter(series => series.data.seriesId !== node.data.seriesId);
                            },
                            error => {
                                this.messageService.add({ severity: 'error', summary: 'Error deleting series', detail: error.message, sticky: true });
                            }
                        );
                    }
                }
                // Clear selections, update tree
                this.selectedContextNode = undefined;
                this.selectedJobNodes = undefined;
                this.selectedJob = undefined;
                this.updateJobTree();
            }
        });
    }

    /**
     * delete a node from the TreeNode[] using index
     * @param index
     */
    deleteNode(index: number, nodes: TreeNode[]) {
        if (index > -1) {
            nodes.splice(index, 1);
            this.updateJobTree();
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
                        () => {
                            this.refreshJobs();
                            this.messageService.add({ severity: 'success', summary: 'Cancel Job', detail: "Job(s) successfully cancelled" });
                        },
                        error => {
                            this.messageService.add({ severity: 'error', summary: 'Error cancelling job', detail: error.message, sticky: true });
                        }
                    );
                }
            });
        }
    }


    /**
     * Duplicate selected job (job context menu)
     *
     * TODO: Re-implement, make sure files are copied
     */
    public duplicateSelectedJob(): void {
        if (this.selectedJob) {
            this.jobsService.duplicateJob(this.selectedJob.id).subscribe(
                result => {
                    if (result.length > 0) {
                        let job: Job = result[0];
                        let node: TreeNode = {};
                        node.leaf = true;
                        node.data = {
                            id: job.id,
                            name: job.name,
                            status: job.status
                        };
                        this.jobs.push(job);
                        this.treeJobsData.push(node);
                        this.updateJobTree();
                    }
                    this.messageService.add({ severity: 'success', summary: 'Duplicate Job', detail: "Job successfully duplicated" });
                }, error => {
                    this.messageService.add({ severity: 'error', summary: 'Error duplicating job', detail: error.message, sticky: true });
                }
            );
        }
    }


    /**
     * Get the status of the selected job (job context menu)
     */
    public showSelectedJobStatus(): void {
        this.httpSubscription = this.jobsService.getAuditLogs(this.selectedJob.id).subscribe(
            auditLogs => {
                const modelRef = this.modalService.open(JobStatusModalComponent);
                modelRef.componentInstance.job = this.selectedJob;
                modelRef.componentInstance.logs = auditLogs;
            },
            error => {
                this.messageService.add({ severity: 'error', summary: 'Error retrieving job status', detail: error.message, sticky: true });
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
                        () => {
                            this.refreshJobs();
                            this.messageService.add({ severity: 'success', summary: 'Job Submitted', detail: 'The job has been submitted' });
                        },
                        error => {
                            this.messageService.add({ severity: 'error', summary: 'Error submitting job', detail: error.message, sticky: true });
                        }
                    );
                }
            });
        }
    }


    /**
     * Edit selected job (job context menu)
     */
    public editSelectedJob(): void {
        if (this.selectedJob) {
            this.router.navigate(['/wizard/job/' + this.selectedJob.id]);
        }
    }


    /**
     * move selected job to the top level(job context menu)
     */
    public moveSelectedJob(): void {
        let rootNode: TreeNode = {};
        rootNode.data = {
            "id": null,
            "seriesId": null,
            "name": null,
            "submitDate": null,
            "status": null,
            "leaf": false,
        };
        if (this.selectedJobNodes.length > 0) {
            let jobIds: number[] = [];
            this.selectedJobNodes.map(job => {
                if (job.data.id) {
                    jobIds.push(job.data.id);
                }
            });
            this.jobsService.setJobFolder(jobIds, null).subscribe(() => {
                this.selectedJobNodes.forEach(jobNode => {
                    let parentNode = jobNode.parent;
                    if (jobNode.data.id) {
                        this.moveToNewFolder(rootNode, jobNode);
                    }
                    if (parentNode && parentNode.children.length === 0) {
                        parentNode.expanded = false;
                    }
                });
            });
        }
    }

    /**
     * drop selected nodes from old position to a new folder.
     * @param node
     */
    drop(node: any, event: any) {
        event.preventDefault();
        if (this.selectedJobNodes.length > 0) {
            let jobIds: number[] = [];
            // get the list of jobs ids to be moved
            this.selectedJobNodes.map(job => {
                if (job.data.id) {
                    jobIds.push(job.data.id);
                }
            });
            // get the new location
            let newFolder: TreeNode = this.treeJobsData.find(nodeElement => nodeElement.data.seriesId === node.data.seriesId);
            let seriesId: number = newFolder.data.seriesId;
            // make the dragged jobs series id to be the new folder id
            this.jobsService.setJobFolder(jobIds, seriesId).subscribe(
                () => {
                    // make the front end node changes for shiftig from old folder to new folder.
                    this.selectedJobNodes.forEach(shiftingNode => {
                        let parentNode = shiftingNode.parent;
                        if (shiftingNode.data.id) {
                            this.moveToNewFolder(newFolder, shiftingNode);
                        }
                        if (parentNode && parentNode.children.length === 0) {
                            parentNode.expanded = false;
                        }
                    });
                },
                error => {
                    this.messageService.add({ severity: 'error', summary: 'Error moving job', detail: error.message, sticky: true });
                }

            );
        }
    }

    /**
     * Move a node to new folder by deleting from existing location
     */
    moveToNewFolder(newFolder: TreeNode, jobNode: TreeNode) {
        // if the node is inside a folder
        if (jobNode.parent) {
            let oldFolder: TreeNode = this.treeJobsData.find(nodeElement => nodeElement.data.seriesId === jobNode.parent.data.seriesId);
            if (oldFolder.children) {
                let shiftingNodeIndex = oldFolder.children.findIndex(childNode => childNode.data.id === jobNode.data.id);
                // delete from old folder
                if (shiftingNodeIndex > -1) {
                    oldFolder.children.splice(shiftingNodeIndex, 1);
                    // add to the new folder
                    this.addToNewFolder(newFolder, jobNode);
                }
            }
        } else {
            // if the node is not inside a folder, it in the main tree
            let shiftingNodeIndex = this.treeJobsData.findIndex(row => row.data.id === jobNode.data.id);
            // delete from the main tree and and add to new folder
            if (shiftingNodeIndex > -1) {
                this.treeJobsData.splice(shiftingNodeIndex, 1);
                // add to the new folder
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
        if (!newFolder.data.id && newFolder.data.seriesId) {
            // add to the new folder
            jobNode.parent = newFolder;
            jobNode.data.seriesId = newFolder.data.seriesId;
            if (newFolder.children) {
                newFolder.children.push(jobNode);
            } else {
                newFolder.children = [];
                newFolder.children.push(jobNode);
            }
        } else {
            // new position is not a folder and is a job node, so append to main tree
            let toIndex = this.treeJobsData.findIndex(row => row.data.id === newFolder.data.id);
            jobNode.parent = null;
            jobNode.data.seriesId = null;
            this.treeJobsData.splice(toIndex + 1, 0, jobNode);
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
    handleDragstart(node: any, event: any) {
        if (node && node.leaf) {
            // set as firefox does not fire drag and drop without this statement
            event.dataTransfer.setData("text", node.data.id);
            let index = this.selectedJobNodes.findIndex(elem => elem.data.id === node.data.id);
            // row chosen not present in selected nodes, so unselect other selected nodes and make this row selected.
            if (index === -1) {
                this.selectedJobNodes.splice(0, this.selectedJobNodes.length);
                this.selectedJobNodes.push(node);
                this.selectedJob = this.jobs.find(j => j.id === node.data.id);
                this.jobSelectionChanged.emit(event);
            }

        }
    }
}
