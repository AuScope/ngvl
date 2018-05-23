import { Component } from '@angular/core';
import { UserStateService } from '../../../shared';
import { TreeJobs, TreeJobNode } from '../../../shared/modules/vgl/models';
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

    // Files user has selected for upload
    jobFileUploads: any[] = [];


    constructor(private userstateService: UserStateService, private jobsService: JobsService, private modalService: NgbModal) {
        this.jobInputNodes = this.getJobInputs();
    }


    /**
     * 
     */
    private getJobInputs(): TreeNode[] {
        let jobNodes: TreeNode[] = [];

        const rootRemoteWebServiceDownloads: TreeNode = {
            data: {
                name: "Remote Web Service Downloads",
                id: "remote",
                expanded: true,
                leaf: false
            },
            children: []
        }
        if(rootRemoteWebServiceDownloads.children.length > 0) {
            rootRemoteWebServiceDownloads.expanded = true;
            jobNodes.push(rootRemoteWebServiceDownloads);
        }

        return jobNodes;
    }


    /**
     * Convert a VGL TreeNode to an p-treetable TreeNode
     * 
     * TODO: This method to JobsService (duplicated in JobsComponent)
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
     * TODO: This method to JobsService (duplicated in JobsComponent)
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
     * 
     */
    public copyFromJob(): void {
        this.jobsService.getTreeJobs().subscribe(
            treeJobs => {
                const treeJobNodes: TreeNode[] = this.createJobsTreeNodes(treeJobs);
                const modelRef = this.modalService.open(JobInputsBrowserModalContent, { size: 'lg' });
                modelRef.componentInstance.treeJobsData = treeJobNodes;
            },
            error => {
                // TODO: Proper error reporting
                console.log(error.message);
            }
        )
    }


    /**
     * 
     */
    public remoteDownload(): void {

    }


    /**
     * 
     */
    public uploadFile(event): void {
        let rootFileInputNode:TreeNode = this.jobInputNodes.find(node => node.data.id === 'upload');
        if(!rootFileInputNode) {
            rootFileInputNode = {
                data: {
                    name: "Your Uploaded Files",
                    id: "upload",
                    expanded: true,
                    leaf: "false"
                },
                children: []
            }
            rootFileInputNode.expanded = true;
            this.jobInputNodes.push(rootFileInputNode);
        }
        for(let file of event.target.files) {
            const fileNode: TreeNode = {
                data: {
                    name: file.name,
                    location: 'Local directory',
                    details: (file.size/1000) + ' KB',
                    leaf: "true"
                }
            }
            rootFileInputNode.children.push(fileNode);
        }
    }

}