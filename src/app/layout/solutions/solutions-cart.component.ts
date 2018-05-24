import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Solution } from '../../shared/modules/vgl/models';
import { UserStateService } from '../../shared';

@Component({
  selector: 'app-solutions-cart',
  templateUrl: './solutions-cart.component.html',
  styleUrls: ['./solutions-cart.component.scss']
})
export class SolutionsCartComponent implements OnInit {

  cart$: Observable<Solution[]>;

  constructor(private userStateService: UserStateService) { }

  ngOnInit() {
    this.cart$ = this.userStateService.selectedSolutions;
  }

  removeSolution(solution: Solution) {
    this.userStateService.removeSolutionFromCart(solution);
  }
}
