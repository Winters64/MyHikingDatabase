import { TestBed } from '@angular/core/testing';

import { Gsheet } from './gsheet';

describe('Gsheet', () => {
  let service: Gsheet;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Gsheet);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
