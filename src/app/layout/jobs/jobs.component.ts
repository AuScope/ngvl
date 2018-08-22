import { Component, OnInit, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { Subscription } from 'rxjs';
import { routerTransition } from '../../router.animations';
import { Job, CloudFileInformation, JobDownload, PreviewComponent } from '../../shared/modules/vgl/models';
import { UserStateService, JOBS_VIEW } from '../../shared';
import { JobBrowserComponent } from './job-browser.component';
import { JobInputsComponent } from './job-inputs.component';
import { JobsService } from './jobs.service';
import { PreviewDirective } from './preview/preview.directive';
import { PlainTextPreview } from './preview/plaintext-preview.component';
import { ImagePreview } from './preview/image-preview.component';
import { PreviewItem } from './preview/preview-item';
import { TtlPreview } from './preview/ttl-preview.component';
import { LogPreview } from './preview/log-preview.component';
import { DataServicePreview } from './preview/data-service-preview.component';
import { environment } from '../../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import olProj from 'ol/proj';
import { point, featureCollection, polygon } from '@turf/helpers';


@Component({
    selector: 'app-jobs',
    templateUrl: './jobs.component.html',
    styleUrls: ['./jobs.component.scss'],
    animations: [routerTransition()]
})


export class JobsComponent implements OnInit {

    @ViewChild('jobBrowser')
    public jobBrowser: JobBrowserComponent;

    @ViewChild('jobInputs')
    public jobInputs: JobInputsComponent;

    // Flag for preview loading spinner
    filePreviewLoading: boolean = false;

    // Name for new folder
    newFolderName: string = "";

    // Preview components
    // TODO: A code preview would be nice
    // TODO: TIFF/BMP support untested, may vary on browser
    previewItems: PreviewItem[] = [
        new PreviewItem("data-service", DataServicePreview, {}, []),
        new PreviewItem("plaintext", PlainTextPreview, {}, ['txt', 'sh', 'log']),
        new PreviewItem("log", LogPreview, {}, ['.sh.log']),
        new PreviewItem("ttl", TtlPreview, {}, ['ttl']),
        new PreviewItem("image", ImagePreview, {}, ['jpg', 'jpeg', 'gif', 'png', 'bmp', 'tiff', 'tif'])
    ];
    @ViewChild(PreviewDirective) previewHost: PreviewDirective;
    // Will be JobDownload or CloudFileInformation, needed for preview Refresh
    currentPreviewObject: any = null;

    // Current HttpClient GET request (for cancellation purposes)
    httpSubscription: Subscription;


    constructor(private componentFactoryResolver: ComponentFactoryResolver,
        private jobsService: JobsService,
        private modalService: NgbModal,
        private userStateService: UserStateService) { }


    ngOnInit() {
        this.userStateService.setView(JOBS_VIEW);
    }


    /**
     * Cancel the current HttpClient request, if any.
     * Also requests any subscribed requests be cancelled in job-browser and
     * job-inputs
     */
    private cancelCurrentSubscription() {
        if (this.httpSubscription && !this.httpSubscription.closed) {
            this.httpSubscription.unsubscribe();
        }
        this.jobBrowser.cancelCurrentSubscription();
        if (this.jobInputs) {
            this.jobInputs.cancelCurrentSubscription();
        }
    }


    /**
     * Refresh the job panel based on any/all faceted search elements
     */
    public refreshJobs(): void {
        this.currentPreviewObject = null;
        this.jobBrowser.refreshJobStatus();
    }


    /**
     * Job selection event from job browser
     * 
     * TODO: Do we still need job? Using jobBrowser.selectedJob works
     * 
     * @param job 
     */
    public jobSelected(job: Job) {
        if (job) {
            this.cancelCurrentSubscription();
            this.filePreviewLoading = false;
            this.currentPreviewObject = null;
            if (this.previewHost) {
                let viewContainerRef = this.previewHost.viewContainerRef;
                viewContainerRef.clear();
            }
        }
    }


    /**
     * Event fired when an input (JobDownload or CloudFileInformation) is selected
     * 
     * @param event 
     */
    public inputSelected(event) {
        this.cancelCurrentSubscription();
        // TODO: Something less hackey to check type
        // Cloud file selected
        if (event.hasOwnProperty('cloudKey')) {
            this.previewCloudFile(event);
        }
        // Download selected
        else {
            this.previewJobDownload(event);
        }
    }


    /**
     * Add the specified PreviewItem to the container
     * 
     * @param previewItem 
     * @param data 
     */
    private previewFile(previewItem: PreviewItem, data: any) {
        previewItem.data = data;
        let viewContainerRef = this.previewHost.viewContainerRef;
        viewContainerRef.clear();
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(previewItem.component);
        let componentRef = viewContainerRef.createComponent(componentFactory);
        (<PreviewComponent>componentRef.instance).data = previewItem.data;
    }


    /**
     * Preview a JobDownload object
     * 
     * TODO: Are there other types of Data Service Downloads?
     * 
     * @param jobDownload 
     */
    previewJobDownload(jobDownload: JobDownload): void {
        let viewContainerRef = this.previewHost.viewContainerRef;
        viewContainerRef.clear();
        let previewItem: PreviewItem = this.previewItems.find(item => item.type === 'data-service');
        this.filePreviewLoading = true;

        // TODO: Will there ever be more than 1 bbox? Confirm...
        let featureArr: any = [];
        featureArr.push(point([jobDownload.westBoundLongitude, jobDownload.northBoundLatitude]));
        featureArr.push(point([jobDownload.westBoundLongitude, jobDownload.southBoundLatitude]));
        featureArr.push(point([jobDownload.eastBoundLongitude, jobDownload.southBoundLatitude]));
        featureArr.push(point([jobDownload.eastBoundLongitude, jobDownload.northBoundLatitude]));

        const key = "preview-key";
        let bboxPolygonArr = {};
        bboxPolygonArr[key] = featureCollection([polygon([[
            olProj.fromLonLat([jobDownload.westBoundLongitude, jobDownload.northBoundLatitude]),
            olProj.fromLonLat([jobDownload.westBoundLongitude, jobDownload.southBoundLatitude]),
            olProj.fromLonLat([jobDownload.eastBoundLongitude, jobDownload.southBoundLatitude]),
            olProj.fromLonLat([jobDownload.eastBoundLongitude, jobDownload.northBoundLatitude]),
            olProj.fromLonLat([jobDownload.westBoundLongitude, jobDownload.northBoundLatitude])
        ]])]);
        bboxPolygonArr[key].crs = {
            'type': 'name',
            'properties': {
                'name': 'EPSG:3857'
            }
        };

        let reCentrePt: any = {};
        // Calculate the envelope, if not too big then re-centred map can be calculated
        const featureColl = featureCollection(featureArr);
        const bboxData = [olProj.fromLonLat([reCentrePt.longitude, reCentrePt.latitude]), bboxPolygonArr];
        this.previewFile(previewItem, bboxData);
        this.filePreviewLoading = false;
        this.currentPreviewObject = jobDownload;
    }


    /**
     * Preview a CloudFileInformation object
     * 
     * @param cloudFile 
     */
    public previewCloudFile(cloudFile: CloudFileInformation): void {
        this.cancelCurrentSubscription();
        let viewContainerRef = this.previewHost.viewContainerRef;
        viewContainerRef.clear();

        let previewItem: PreviewItem = undefined;

        // Job log file is a special case, look for this first
        if(cloudFile.name === "vl.sh.log") {
            previewItem = this.previewItems.find(item => item.type === 'log');
        } else {
            const extension = cloudFile.name.substr(cloudFile.name.lastIndexOf('.') + 1).toLowerCase();
            previewItem = this.previewItems.find(item => item.extensions.indexOf(extension) > -1);
        }
        // If the type can't be found, we'll try plain text
        // TODO: What if it's binary, check this out
        if(previewItem === undefined) {
            previewItem = this.previewItems.find(item => item.type === 'plaintext');
        }
        // Preview image
        if (previewItem && previewItem.type === 'image') {
            this.currentPreviewObject = cloudFile;
            const imageUrl = environment.portalBaseUrl + "secure/getImagePreview.do?jobId=" + this.jobBrowser.selectedJob.id + "&file=" + cloudFile.name + "&_dc=" + Math.random();
            this.previewFile(previewItem, imageUrl);
        }
        // Log files currently displayed as plain text, but this class will
        // allow us to make imporvements to display later (e.g. display
        // sectioned logs in tabs per section)
        else if (previewItem && (previewItem.type === 'log')) {
            this.filePreviewLoading = true;
            this.httpSubscription = this.jobsService.getSectionedLogs(this.jobBrowser.selectedJob.id).subscribe(
                logData => {
                    this.previewFile(previewItem, logData);
                    this.currentPreviewObject = cloudFile;
                    this.filePreviewLoading = false;
                },
                error => {
                    //TODO: Proper error reporting
                    this.filePreviewLoading = false;
                    this.currentPreviewObject = null;
                    console.log(error.message);
                }
            );
        }
        // Preview text (default option if type can't be determined by extension)
        else if (previewItem && (previewItem.type === 'plaintext' || previewItem.type === 'ttl')) {
            this.filePreviewLoading = true;
            // TODO: Max file size to config
            this.httpSubscription = this.jobsService.getPlaintextPreview(this.jobBrowser.selectedJob.id, cloudFile.name, 20 * 1024).subscribe(
                previewData => {
                    this.previewFile(previewItem, previewData);
                    this.currentPreviewObject = cloudFile;
                    this.filePreviewLoading = false;
                },
                error => {
                    //TODO: Proper error reporting
                    this.filePreviewLoading = false;
                    this.currentPreviewObject = null;
                    console.log(error.message);
                }
            );
        }
    }


    /**
     * Refresh the preview panel
     */
    refreshPreview(): void {
        if (this.currentPreviewObject) {
            // Hacky type check
            if (this.currentPreviewObject.hasOwnProperty('localPath')) {
                this.previewJobDownload(this.currentPreviewObject);
            } else {
                this.previewCloudFile(this.currentPreviewObject);
            }
        }
    }


    /**
     * Add a folder to the Job tree new Jobs can be added to
     * 
     * @param folderName the name of the folder to be added
     */
    public addFolder(folderName: string): void {
        this.jobsService.addFolder(folderName).subscribe(
            series => {
                console.log(JSON.stringify(series));
                this.jobBrowser.refreshJobs();   
            },
            // TODO: Proper error reporting
            error => {
                console.log(error.message);
            }
        );
    }


    /**
     * Show a dialog for adding a folder to the Job tree
     * 
     * @param content the add folder modal content
     */
    public showAddFolderModal(content): void {
        this.newFolderName = "";
        this.modalService.open(content).result.then((result) => {
            if (result === 'OK click' && this.newFolderName !== '') {
                this.addFolder(this.newFolderName);
            }
        }, () => {});
    }

}