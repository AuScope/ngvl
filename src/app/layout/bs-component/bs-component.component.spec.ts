import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BsComponentComponent } from './bs-component.component';
import { PageHeaderModule } from '../../shared';
import { ModalComponent, AlertComponent, ButtonsComponent, CollapseComponent, DatePickerComponent, DropdownComponent, PaginationComponent, PopOverComponent, ProgressbarComponent, TabsComponent, TooltipComponent, TimepickerComponent, RatingComponent } from './components';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('BsComponentComponent', () => {
    let component: BsComponentComponent;
    let fixture: ComponentFixture<BsComponentComponent>;

    beforeEach(
        async(() => {
            TestBed.configureTestingModule({
                declarations: [BsComponentComponent, ModalComponent,
                    AlertComponent, ButtonsComponent, CollapseComponent,
                    DatePickerComponent, DropdownComponent,
                    PaginationComponent, PopOverComponent,
                    ProgressbarComponent, TabsComponent, TooltipComponent,
                    TimepickerComponent, RatingComponent],
                imports: [
                    PageHeaderModule,    // Or declare component?
                    FormsModule,
                    ReactiveFormsModule,
                    RouterTestingModule,
                    NgbModule.forRoot()
                ]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(BsComponentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
