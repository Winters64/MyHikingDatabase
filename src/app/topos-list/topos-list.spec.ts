import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToposList } from './topos-list';

describe('ToposList', () => {
  let component: ToposList;
  let fixture: ComponentFixture<ToposList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToposList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToposList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
