import { SolutionsModule } from './solutions.module';

describe('SolutionsModule', () => {
  let solutionsModule: SolutionsModule;

  beforeEach(() => {
    solutionsModule = new SolutionsModule();
  });

  it('should create an instance', () => {
    expect(solutionsModule).toBeTruthy();
  });
});
