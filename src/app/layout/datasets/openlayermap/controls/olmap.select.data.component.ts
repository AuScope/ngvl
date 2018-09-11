import { Component } from '@angular/core';
import { ConfirmDatasetsModalContent } from '../../confirm-datasets.modal.component';
import { DownloadOptions } from '../../../../shared/modules/vgl/models';
import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';
import { OlMapService } from 'portal-core-ui/service/openlayermap/ol-map.service';
import { OnlineResourceModel } from 'portal-core-ui/model/data/onlineresource.model';
import { CSWSearchService } from '../../../../shared/services/csw-search.service';
'../../../shared/services/csw-search.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TreeNode } from 'primeng/api';
import olExtent from 'ol/extent';
import olProj from 'ol/proj';


@Component({
    selector: 'app-ol-map-select-data',
    templateUrl: './olmap.select.data.component.html',
    styleUrls: ['./olmap.select.data.component.scss']
})

export class OlMapDataSelectComponent {

    buttonText = 'Select Data';


    constructor(private olMapService: OlMapService,private cswSearchService: CSWSearchService,
        private modalService: NgbModal) { }


    /**
     * toggle on zoom to zoom into bbox
     */
    public selectDataClick() {
        this.buttonText = 'Click on Map';
        this.olMapService.drawBound().subscribe((vector) => {
            // Check for intersections with active layer CSW record extents
            let extent: olExtent = vector.getSource().getExtent();
            const cswRecords: CSWRecordModel[] = this.olMapService.getCSWRecordsForExtent(extent);

            // Get 4326 projection
            extent = olProj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');

            // Display confirm datasets modal
            if (cswRecords.length > 0) {
                const modelRef = this.modalService.open(ConfirmDatasetsModalContent, { size: 'lg' });
                modelRef.componentInstance.cswRecordTreeData = this.buildTreeData(cswRecords, extent);
            }
            this.buttonText = 'Select Data';
        });
    }


    /**
     * Return a count of the active layers on the map
     * 
     * TODO: This is used elsewhere, should make a map service method
     */
    public getActiveLayerCount(): number {
        return Object.keys(this.olMapService.getLayerModelList()).length;
    }


    /**
     * Builds TreeTable from supplied CSWRecords for display in the confirm
     * datasets modal
     *
     * @param cswRecords list of CSWRecords from which to construct a list of
     *                   TreeNodes
     * @param region the user selected region, may be the entire CSWRecord
     *               extent or a subset
     * @return list of TreeNodes used to build the TreeTable
     */
    public buildTreeData(cswRecords: CSWRecordModel[], region: olExtent): TreeNode[] {
        let cswRecordTreeNodes: TreeNode[] = [];
        if (cswRecords != null) {
            // Construct bouns
            let defaultBbox: any = null;
            if (region) {
                defaultBbox = {
                    northBoundLatitude: region[3],
                    eastBoundLongitude: region[2],
                    southBoundLatitude: region[1],
                    westBoundLongitude: region[0]
                }
            }

            // Construct root resource nodes for each type of resource
            let resourceTypeNodes: TreeNode[] = [];
            for (let resourceType in this.cswSearchService.supportedOnlineResources) {
                let rootResourceNode: TreeNode = {};
                rootResourceNode.data = {
                    "id": resourceType,
                    "name": this.cswSearchService.supportedOnlineResources[resourceType].name,
                    "leaf": false
                }
                rootResourceNode.children = [];
                resourceTypeNodes.push(rootResourceNode);
            }

            for (let record of cswRecords) {
                let foundResourceTypeForRecord: boolean = false;
                for (let resourceType in this.cswSearchService.supportedOnlineResources) {
                    let rootResourceNode = resourceTypeNodes.find(node => node.data['id'] === resourceType);
                    const onlineResources: OnlineResourceModel[] = this.cswSearchService.getOnlineResourcesByType(record, resourceType);
                    if (onlineResources.length > 0) {
                        // Get the first supported online resource
                        for (const resource of onlineResources) {
                            if (this.cswSearchService.isResourceSupported(resource)) {
                                let downloadOptions: DownloadOptions = this.cswSearchService.createDownloadOptionsForResource(resource, record, defaultBbox);
                                let node: TreeNode = {};
                                node.data = {
                                    "name": downloadOptions.name,
                                    "url": downloadOptions.url,
                                    "cswRecord": record,
                                    "onlineResource": resource,
                                    "defaultOptions":JSON.parse(JSON.stringify(downloadOptions)),
                                    "downloadOptions": downloadOptions,
                                    "leaf": true
                                }
                                rootResourceNode.children.push(node);
                                foundResourceTypeForRecord = true;
                                break;
                            }
                        }
                        // Stop iterating online resource types if we've found a supported type
                        if (foundResourceTypeForRecord) {
                            break;
                        }
                    } else {
                        // TODO: REMOVE, but may want to report if no valid resource at all
                        console.log("No " + resourceType + " resources found for record ");
                    }
                }
            }

            // Add resource type nodes to tree if any were found
            for (let resourceNode of resourceTypeNodes) {
                if (resourceNode.children.length > 0) {
                    resourceNode.expanded = true;
                    cswRecordTreeNodes.push(resourceNode);
                }
            }
        }
        return cswRecordTreeNodes;
    }

}