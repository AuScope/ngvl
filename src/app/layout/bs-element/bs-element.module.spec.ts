import { BsElementModule } from './bs-element.module';
import { async, TestBed } from '@angular/core/testing';
import { PageHeaderModule } from '../../shared';

describe('BsElementModule', () => {
    let bsElementModule: BsElementModule;

    beforeEach(
        async(() => {
            TestBed.configureTestingModule({
                imports: [ PageHeaderModule ]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        bsElementModule = new BsElementModule();
    });

    it('should create an instance', () => {
        expect(bsElementModule).toBeTruthy();
    });
});
