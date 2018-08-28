import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { routerTransition } from "../../router.animations";
import { UserStateService, AuthService } from "../../shared";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/components/common/messageservice';
import { User, NCIDetails } from "../../shared/modules/vgl/models";


@Component({
    selector: 'app-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss'],
    animations: [routerTransition()]
})
export class UserManagementComponent implements OnInit {

    // User object contains AWS information
    private user: User = undefined;

    // User NCI fields
    private nciDetails: NCIDetails = undefined;
    private nciKeyfile: any = undefined;

    // T&C's dialog
    @ViewChild('termsAndConditionsModal')
    private notacsDialog;
    // T&C's HTML content (retrieved from server)
    private tacsHTML: string = "";

    // Compute services not configured dialog
    @ViewChild('computeServicesNotConfiguredModal')
    private noconfigDialog;


    constructor(private route: ActivatedRoute, private userStateService: UserStateService,
                private messageService: MessageService, private modalService: NgbModal,
                private authService: AuthService) { }


    ngOnInit() {
        // Retrieve the NCI details
        this.loadUserAndNciDetails();

        // Check if we've been routed here because T&C's have not been accepted
        setTimeout(() => {  // Skip a tick to avoid ExpressionChangedAfterItHasBeenCheckedError
            this.route.queryParams
                .subscribe(params => {
                    // T&C's have not been agreed to, show dialog
                    if(params.hasOwnProperty('notacs') && params['notacs']==='1') {
                        this.userStateService.getTermsAndConditions().subscribe(
                            tacsResponse => {
                                this.tacsHTML = tacsResponse.data.html;                                
                                this.modalService.open(this.notacsDialog, { backdrop: 'static', keyboard:false }).result.then((result) => {
                                    if (result === 'accept') {
                                        this.acceptTermsAndConditions();
                                    } else if(result==='reject') {
                                        this.authService.logout();
                                    }
                                });
                            }
                        )
                    }
                    // Compute services required dialog
                    else if(params.hasOwnProperty('noconfig') && params['noconfig']==='1') {
                        this.modalService.open(this.noconfigDialog);
                    }
            });
        });
    }


    /**
     * Retrieve the User's NCI details
     */
    private loadUserAndNciDetails(): void {
        // Retrieve user details
        this.userStateService.user.subscribe(
            user => {
                this.user = user;
                this.userStateService.nciDetails.subscribe(
                    nciDetails => {
                        this.nciDetails = nciDetails;
                        if (nciDetails) {
                            if (this.nciDetails.nciKey) {
                                this.nciDetails.nciKey = "-- Saved --";
                            } else {
                                this.nciDetails.nciKey = "";
                            }
                        } else {
                            this.nciDetails = this.createEmptyNciDetailsObject();
                        }
                    }, error => {
                        this.messageService.add({ severity: 'error', summary: 'Error Retreiving NCI Details', detail: error.message });
                    }
                );
            }, error => {
                this.messageService.add({ severity: 'error', summary: 'Error Retreiving User Details', detail: error.message });
            }
        );
    }


    /**
     * 
     */
    private createEmptyNciDetailsObject(): NCIDetails {
        return {
            nciUsername: '',
            nciProject: '',
            nciKey: ''
        };
    }


    /**
     * User has accepted T&C's. Leverage existing AWS function to write this back to DB
     */
    private acceptTermsAndConditions(): void {
        this.userStateService.setUserAwsDetails(this.user.arnExecution, this.user.arnStorage, 1, this.user.awsKeyName).subscribe();
    }

    
    /**
     * Download the Cloud Formation Policy (AWS)
     */
    public downloadCloudFormationPolicy(): void {
        this.userStateService.downloadCloudFormationScript();
    }


    /**
     * Save User AWS changes
     */
    public saveAwsChanges(): void {
        // TODO: Assumes already accepted T&Cs, need a screen for this
        this.userStateService.setUserAwsDetails(this.user.arnExecution, this.user.arnStorage, 1, this.user.awsKeyName).subscribe(
            response => {
                this.messageService.add({ severity: 'success', summary: 'Changes Saved', detail: 'Your AWS details have been updated' });
            }, error => {
                this.messageService.add({ severity: 'error', summary: 'Error Saving Changes', detail: error.message });
            }
        )
    }


    /**
     * New NCI key file selected, update text input and file object
     * 
     * @param event file selected event
     */
    public nciKeyFileChanged(event): void {
        this.nciKeyfile = event.target.files[0];
        this.nciDetails.nciKey = event.target.files[0].name;
    }


    /**
     * Save User NCI changes
     */
    public saveNciChanges(): void {
        if(this.nciDetails) {
            this.userStateService.setUserNciDetails(this.nciDetails.nciUsername, this.nciDetails.nciProject, this.nciKeyfile).subscribe(
                response => {
                    this.messageService.add({ severity: 'success', summary: 'Changes Saved', detail: 'Your NCI details have been updated' });
                }, error => {
                    this.messageService.add({ severity: 'error', summary: 'Error Saving Changes', detail: error.message });
                }
            )
        }
    }
}
