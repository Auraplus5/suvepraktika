import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutsListComponent } from './checkouts-list.component';

describe('CheckoutsListComponent', () => {
  let component: CheckoutsListComponent;
  let fixture: ComponentFixture<CheckoutsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckoutsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckoutsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
