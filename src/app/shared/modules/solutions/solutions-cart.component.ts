import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Solution } from '../vgl/models';
import { UserStateService } from '../../services';

@Component({
  selector: 'app-solutions-cart',
  templateUrl: './solutions-cart.component.html',
  styleUrls: ['./solutions-cart.component.scss']
})
export class SolutionsCartComponent implements OnInit {
  @Input() selected: string;
  @Output() selectedChange = new EventEmitter<string>();

  cart$: Observable<Solution[]>;

  constructor(private userStateService: UserStateService) {}

  ngOnInit() {
    this.cart$ = this.userStateService.selectedSolutions;
  }

  selectSolution(solution: Solution) {   
    this.selected = solution.id;
    this.selectedChange.emit(this.selected);
  }

  removeSolution(solution: Solution) {   
    this.userStateService.removeSolutionFromCart(solution);
  }
}
