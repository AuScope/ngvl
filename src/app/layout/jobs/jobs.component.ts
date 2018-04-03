import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { TreeJobs, TreeJobNode, Job } from '../../shared/modules/vgl/models';
import { JobsService } from './jobs.service';
import { TreeNode } from 'primeng/api';


@Component({
    selector: 'app-jobs',
    templateUrl: './jobs.component.html',
    styleUrls: [
        './jobs.component.scss'
    ],
    animations: [routerTransition()]
})


export class JobsComponent implements OnInit {

    treeJobsData: TreeNode[];
    selectedJobNode: TreeNode;
    jobs: Job[];
    selectedJob: Job;


    constructor(private jobsService: JobsService) { }


    /**
     * A new job has been selected, update file panel
     * 
     * @param event the select node event
     */
    public jobSelected(event) {
        if(event.node && event.node.data.leaf) {
            this.selectedJob = this.jobs.find(j => j.id === event.node.data.id);
            console.log("Just pulled job from array: " + JSON.stringify(this.selectedJob));
        }
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
        console.log(JSON.stringify(treeData));
        return treeData;
    }


    ngOnInit() {
        this.jobsService.getTreeJobs().subscribe(
            treeJobs => {
                this.treeJobsData = this.createTreeJobsData(treeJobs);
                this.jobs = treeJobs.jobs;
            },
            // TODO: Proper error reporting
            error => {
                console.log("Error: " + error.message);
            }
        );
    }
}
