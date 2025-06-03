import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourseLevelComponent } from './course-level.component';

describe('CourseLevelComponent', () => {
  let component: CourseLevelComponent;
  let fixture: ComponentFixture<CourseLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseLevelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CourseLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
