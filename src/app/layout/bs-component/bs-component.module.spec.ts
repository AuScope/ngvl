import { BsComponentModule } from './bs-component.module';
import { async, TestBed } from '@angular/core/testing';
import { PageHeaderModule } from '../../shared';

describe('BsComponentModule', () => {
    let bsComponentModule: BsComponentModule;

    beforeEach(
        async(() => {
            TestBed.configureTestingModule({
                imports: [ PageHeaderModule ]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        bsComponentModule = new BsComponentModule();
    });

    it('should create an instance', () => {
        expect(bsComponentModule).toBeTruthy();
    });
});
