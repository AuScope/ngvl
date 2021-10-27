import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GraceGraphModalComponent2 } from './grace-graph.modal.component2';
/*
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
*/
import { GraceService } from './grace.service';

/*
 * TODO: Catch modal close (or dismiss) and cancel GRACE query Subscription
 */
@Component({
    selector: 'app-basin-chooser-modal-content',
    templateUrl: './basin-chooser.modal.component.html',
    styleUrls: ['./basin-chooser.modal.component.scss']
})
export class BasinChooserModalComponent implements OnInit {

    drainageBasins: string[] = [];
    selectedBasin = "";

    constructor(public activeModal: NgbActiveModal, private modalService: NgbModal, private graceService: GraceService) {}

    ngOnInit() {
        this.graceService.getDrainageBasins().subscribe(basins => {
            this.drainageBasins = basins;
        }, error => {
            // TODO: Proper error reporting
            console.error(error);
        });
    }

    /*
    search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            map(term => term.length < 2 ? []
                : this.drainageBasins.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )
    */

    validSelection(): boolean {
        return this.drainageBasins.indexOf(this.selectedBasin) !== -1;
    }

    selectBasin() {
        this.activeModal.close();
        const modalRef = this.modalService.open(GraceGraphModalComponent2, { size: 'lg' });
        modalRef.componentInstance.drainageBasin = this.selectedBasin;
        console.log("Selected: " + this.selectedBasin);
    }

}
