import { Component } from '@angular/core';
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


    constructor(private jobsService: JobsService, private modalService: NgbModal) {
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
     * 
     */
    public copyFromJob(): void {
        this.jobsService.getTreeJobs().subscribe(
            treeJobs => {
                const modelRef = this.modalService.open(JobInputsBrowserModalContent, { size: 'lg' });
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