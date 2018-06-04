import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { map, tap, pluck, switchMap } from 'rxjs/operators';

import { routerTransition } from '../../router.animations';
import { VglService } from '../../shared/modules/vgl/vgl.service';
import { Solution } from '../../shared/modules/vgl/models';
import { UserStateService } from '../../shared';

@Component({
  selector: 'app-solutions-detail',
  templateUrl: './solutions-detail.component.html',
  styleUrls: ['./solutions-detail.component.scss'],
  animations: [routerTransition()]
})
export class SolutionsDetailComponent implements OnInit {

  solution$: Observable<Solution>;

  constructor(private route: ActivatedRoute,
              private location: Location,
              private http: HttpClient,
              private vgl: VglService,
              private userStateService: UserStateService) {}

  ngOnInit() {
    // Track the solution we have to display based on our route parameter.
    this.solution$ = this.route.paramMap.pipe(

      // Switch to the Solution we get from the vgl service.
      switchMap(params => this.vgl.getSolution(params.get('id'))),

      // Fetch the template content for the solution as an Observable<string>.
      map(solution => {
        return {
          ...solution,
          template$: this.http.get(solution.template, {responseType: 'text'})
        };
      })
    );
  }

  selectSolution(solution: Solution) {
    this.userStateService.addSolutionToCart(solution);
    this.location.back();
  }

}
