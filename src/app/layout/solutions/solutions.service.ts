import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { VglService } from '../../shared/modules/vgl/vgl.service';
import { Problem } from '../../shared/modules/vgl/models';

@Injectable()
export class SolutionsService {

  constructor(private vgl: VglService) {}

  public getSolutions(): Observable<Problem[]> {
    return this.vgl.problems;
  }

}
