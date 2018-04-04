import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { TreeJobs, TreeJobNode, Job, JobFile, CloudFileInformation } from '../../shared/modules/vgl/models';
import { JobsService } from './jobs.service';
import { TreeNode } from 'primeng/api';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


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

    // Jobs
    jobs: Job[] = [];
    selectedJob: Job = null;

    // Job cloud files
    cloudFiles: CloudFileInformation[] = [];

    // Spinner flags
    jobsLoading: boolean = false;
    filesLoading: boolean = false;
    filePreviewLoading: boolean = false;

    newFolderName: string = "";

    cloudFilesIsCollapsed: boolean = false;
    jobDownloadsIsCollapsed: boolean = false;


    constructor(private jobsService: JobsService, private modalService: NgbModal) { }


    /*
    private addCloudFilesToFileTree(cloudFiles: CloudFileInformation[]) {
        if(cloudFiles.length > 0) {
            for(let file of cloudFiles) {
                //let node: TreeNode = { data: {name: file.name, size: file.size} };
                //this.treeFileData.push(node);
            }
        }
        
    }
    */


    /**
     * A new job has been selected, update file panel
     * 
     * TODO: IMPORTANT! Cancel all in-progress calls when job is selected,
     * as currently it's possible cloud files will be added to wrong job XXX
     * 
     * @param event the select node event
     */
    public jobSelected(event) {
        // Reset Job object and file tree objects
        this.selectedJob = null;
        this.cloudFiles = [];

        if(event.node && event.node.data.leaf) {
            this.selectedJob = this.jobs.find(j => j.id === event.node.data.id);
            if(this.selectedJob) {
                // Request job cloud files
                this.jobsService.getJobCloudFiles(this.selectedJob.id).subscribe(
                    //fileDetails => this.addCloudFilesToFileTree(fileDetails),
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
     * 
     * @param event 
     */
    /*
    public filesSelected(event) {
        this.selectedFiles = [];
        if(event.node) {
            console.log("XXX Selecting files...");
            //this.selectedFiles = this.files.find(f => f.id in event.nodes.);
        }
    }
    */


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
    public refreshJobs() {
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
    public addFolder(folderName: string) {
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
    public showAddFolderModal(content) {
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
