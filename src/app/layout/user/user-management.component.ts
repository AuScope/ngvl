import { Component, OnInit } from "@angular/core";
import { routerTransition } from "../../router.animations";
import { UserStateService } from "../../shared";
import { Message } from 'primeng/components/common/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { User } from "../../shared/modules/vgl/models";



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
    nciUsername: string = "";
    nciProjectCode: string = "";
    nciKey: string = "";
    nciKeyfile: any = undefined;


    constructor(private userStateService: UserStateService, private messageService: MessageService) { }


    ngOnInit() {
        this.userStateService.user.subscribe(
            user => {
                this.user = user;
                this.userStateService.getUserNciDetails().subscribe(
                    response => {
                        if (response) {
                            this.nciUsername = response.nciUsername;
                            this.nciProjectCode = response.nciProject;
                            this.nciKeyfile = null;
                            if(response.nciKey) {
                                this.nciKey = "-- Saved --";
                            } else {
                                this.nciKey = "";
                            }
                        }
                    }, error => {
                        this.messageService.add({ severity: 'error', summary: 'Error Retreiving NCI Details', detail: error.message });
                    }
                );
            }
        );
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
        this.nciKey = event.target.files[0].name;
    }


    /**
     * Save User NCI changes
     */
    public saveNciChanges(): void {
        this.userStateService.setUserNciDetails(this.nciUsername, this.nciProjectCode, this.nciKeyfile).subscribe(
            response => {
                this.messageService.add({ severity: 'success', summary: 'Changes Saved', detail: 'Your NCI details have been updated' });
            }, error => {
                this.messageService.add({ severity: 'error', summary: 'Error Saving Changes', detail: error.message });
            }
        )
    }
}
