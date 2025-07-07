import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HikesList } from './hikes-list';

describe('HikesList', () => {
  let component: HikesList;
  let fixture: ComponentFixture<HikesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HikesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HikesList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
