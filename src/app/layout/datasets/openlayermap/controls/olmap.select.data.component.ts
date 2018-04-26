import { OlMapService } from 'portal-core-ui/service/openlayermap/ol-map.service';
import { Component } from '@angular/core';
import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import olExtent from 'ol/extent';
import olLayer from 'ol/layer/layer';
import olProj from 'ol/proj';
import { ConfirmDatasetsModalContent } from '../../confirm-datasets.modal.component';
import { OnlineResourceModel } from 'portal-core-ui/model/data/onlineresource.model';
import { TreeNode } from 'primeng/api';



@Component({
    selector: 'app-ol-map-select-data',
    templateUrl: './olmap.select.data.component.html',
    styleUrls: ['./olmap.select.data.component.scss']
})

export class OlMapDataSelectComponent {

    // Types of online resources
    // TODO: repeated, move to constants
    onlineResources: any = {
        'NCSS': {
            'name': 'NetCDF Subset Services',
            'expanded': true
        },
        'WCS': {
            'name': 'OGC Web Coverage Service 1.0.0',
            'expanded': true
        },
        'WMS': {
            'name': 'OGC Web Map Service 1.1.1',
            'expanded': true
        },
        'WWW': {
            'name': 'Web Link',
            'expanded': true
        }
    };

    buttonText = 'Select Data';


    constructor(private olMapService: OlMapService, private modalService: NgbModal) { }


    /**
     * toggle on zoom to zoom into bbox
     */
    public selectDataClick() {
        this.buttonText = 'Click on Map';
        this.olMapService.drawBound().subscribe((vector) => {
            // Zoom to features
            const features = vector.getSource().getFeatures();
            const me = this;
            features.forEach(function (feature) {
                me.olMapService.fitView(feature.getGeometry().getExtent());
            });
            // Check for intersections with active layer CSW record extents
            let extent: olExtent = vector.getSource().getExtent();
            const cswRecords: CSWRecordModel[] = this.olMapService.getCSWRecordsForExtent(extent);
            // Display confirm datasets modal
            if(cswRecords.length > 0) {
                const modelRef = this.modalService.open(ConfirmDatasetsModalContent);
                const treeData: TreeNode[] = this.buildTreeData(cswRecords);
                //modelRef.componentInstance.cswRecords = cswRecords;
                modelRef.componentInstance.cswRecordTreeData = treeData;
            }

            this.buttonText = 'Select Data';
        });
    }


    /**
     * TODO: This is used elsewhere, should make a map service method
     */
    public getActiveLayerCount(): number {
        return Object.keys(this.olMapService.getLayerModelList()).length;
    }


    /**
     * Get a list of online resource types for iteration
     * 
     * TODO: Repeated, better off elsewhere?
     */
    getOnlineResourceTypes(): string[] {
        return Object.keys(this.onlineResources);
    }


    /**
     * Get all online resources of a particular resource type for a given
     * CSW record
     * 
     * TODO: Repeated, better off elsewhere?
     * 
     * @param cswRecord the CSW Record
     * @param resourceType  the resource type
     */
    public getOnlineResources(cswRecord: CSWRecordModel, resourceType: string): OnlineResourceModel[] {
        let serviceList: OnlineResourceModel[] = [];
        for (const onlineResource of cswRecord.onlineResources) {
            if (onlineResource.type === resourceType) {
                let res: OnlineResourceModel = onlineResource;
                serviceList.push(res);
            }
        }
        return serviceList;
    }


    /**
     * 
     * @param cswRecords 
     */
    public buildTreeData(cswRecords: CSWRecordModel[]): TreeNode[] {
        let cswRecordTreeNodes: TreeNode[] = [];
        if (cswRecords != null) {
            for (const record of cswRecords) {
                // TODO: Work out actual logic about what gets included. Will start with NetCDF only XXX
                const onlineResources: OnlineResourceModel[] = this.getOnlineResources(record, 'NCSS');
                if (onlineResources.length > 0) {
                    let rootNcssNode: TreeNode = {};
                    rootNcssNode.data = {
                        "name": this.onlineResources.NCSS.name,
                        "leaf": false
                    }
                    rootNcssNode.children = [];
                    for (const resource of onlineResources) {
                        let node: TreeNode = {};
                        console.log('URL: ' + resource.description);
                        node.data = {
                            "name": resource.name,
                            "url": resource.description,
                            "leaf": true
                        }
                        rootNcssNode.children.push(node);
                    }
                    cswRecordTreeNodes.push(rootNcssNode);
                } else {
                    // TODO: Report no NCSS online resource
                    console.log("No NCSS online resources");
                }
            }
        }
        return cswRecordTreeNodes;
    }

}
