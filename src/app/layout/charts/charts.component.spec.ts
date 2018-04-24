import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartsComponent } from './charts.component';
import { PageHeaderModule } from '../../shared';
import { ChartsModule as Ng2Module } from 'ng2-charts/ng2-charts';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ChartsComponent', () => {
    let component: ChartsComponent;
    let fixture: ComponentFixture<ChartsComponent>;

    beforeEach(
        async(() => {
            TestBed.configureTestingModule({
                declarations: [ ChartsComponent ],
                imports: [ PageHeaderModule, Ng2Module, RouterTestingModule, BrowserAnimationsModule ]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ChartsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
