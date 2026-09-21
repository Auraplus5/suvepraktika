import { Component, OnInit } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Checkout } from 'src/app/models/Checkout';
import { Page, PageRequest } from 'src/app/models/page';
import { CheckoutService } from 'src/app/services/checkout.service';

@Component({
  selector: 'app-checkouts-list',
  templateUrl: './checkouts-list.component.html',
  styleUrls: ['./checkouts-list.component.css']
})
export class CheckoutsListComponent implements OnInit {
  displayedColumns = ['name', 'borrowedBook', 'checkedOutDate', 'dueDate', 'details']
  pageRequest: PageRequest = {
    pageIndex: 0,
    pageSize: 20
  }
  currentPage?: Page<Checkout>
  checkouts$!: Observable<Page<Checkout>>;

  constructor(
    private checkOutService: CheckoutService
  ) {}

  ngOnInit() {
    this.loadCheckouts(this.pageRequest);
  }

  loadCheckouts(filter: Partial<PageRequest>): void {
    this.pageRequest = {...this.pageRequest, ...filter}
    this.checkouts$ = this.checkOutService.getCheckouts(this.pageRequest).pipe(
      tap(page => {
        this.currentPage = page;
        this.pageRequest = {...this.pageRequest, pageIndex: page.number};
      })
    );
  }

  next(): void {
    if(this.hasNext()){
      this.loadCheckouts({pageIndex: this.pageRequest.pageIndex + 1});
    }
  }

  previous(): void {
    if(this.hasPrevious()) {
      this.loadCheckouts({pageIndex: this.pageRequest.pageIndex - 1});
    }
  }

  hasNext(): boolean {
    return this.currentPage?.number !== undefined && this.currentPage.number < (this.currentPage?.totalPages ?? 0) - 1;
  }

  hasPrevious(): boolean {
    return this.currentPage?.number !== undefined && this.currentPage.number > 0;
  }

  reset(): void {
    this.pageRequest = {pageIndex: 0, pageSize: 20};
    this.loadCheckouts(this.pageRequest);
  }

  sort(element: string): void {
    if(element !== this.pageRequest.sort) {
      this.loadCheckouts({pageIndex: 0, pageSize: 20, sort: element, direction: 'asc'});
    } else {
      const direction = this.pageRequest.direction === 'asc' ? 'desc' : 'asc';
      this.loadCheckouts({pageIndex: 0, pageSize: 20, sort: element, direction: direction});
    }
  }

}
