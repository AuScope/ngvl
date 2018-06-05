import { Component } from "@angular/core";
import { routerTransition } from "../../router.animations";



@Component({
    selector: 'app-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss'],
    animations: [routerTransition()]
})
export class UserManagementComponent {

    // User AWS fields
    vglAccessArn: string = "";
    jobInstanceArn: string = "";
    awsKeyName: string = "";

    // User NCI fields
    nciUsername: string = "";
    nciProjectCode: string = "";
    nciKey: string = "";
    nciKeyfile: any = undefined;


    constructor() { }


    /**
     * Download the Cloud Formation Policy (AWS)
     */
    public downloadCloudFormationPolicy(): void {
    }


    /**
     * Save User AWS changes
     */
    public saveAwsChanges(): void {
    }


    /**
     * New NCI key file selected, update text input and fil object
     * 
     * @param event file selected event
     */
    public nciKeyFileChanged(event): void {
        this.nciKeyfile = event.traget.files[0];
        this.nciKey = event.target.files[0].name;
    }


    /**
     * Save User NCI changes
     */
    public saveNciChanges(): void {
    }
}
