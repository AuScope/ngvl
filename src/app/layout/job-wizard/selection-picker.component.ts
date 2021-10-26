import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';

import { UserStateService } from '../../shared';
import { JobDownload } from '../../shared/modules/vgl/models';

@Component({
  selector: 'app-selection-picker',
  templateUrl: './selection-picker.component.html',
  styleUrls: ['./selection-picker.component.css']
})
export class SelectionPickerComponent implements OnInit {

  jobDownloads$: Observable<JobDownload[]>;

  @Output() picked = new EventEmitter<string>();

  constructor(private userStateService: UserStateService) {}

  ngOnInit(): void {
    this.jobDownloads$ = this.userStateService.jobDownloads;
  }

  pickDownload(jd: JobDownload) {
    const bbox = jd.westBoundLongitude + ", "
      + jd.southBoundLatitude + ", "
      + jd.eastBoundLongitude + ", "
      + jd.northBoundLatitude;
    this.picked.emit(bbox);
  }

}
