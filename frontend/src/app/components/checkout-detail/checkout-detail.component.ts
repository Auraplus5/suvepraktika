import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, switchMap, tap } from 'rxjs';
import { Checkout } from 'src/app/models/Checkout';
import { CheckoutService } from 'src/app/services/checkout.service';

@Component({
  selector: 'app-checkout-detail',
  templateUrl: './checkout-detail.component.html',
  styleUrls: ['./checkout-detail.component.css']
})
export class CheckoutDetailComponent implements OnInit {
  checkout$!: Observable<Checkout>;
  checkoutId!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private checkOutService: CheckoutService,
  ) {}

  ngOnInit(): void {
    this.checkout$ = this.route.params.pipe(
      map(params => params['id']),
      tap(id => this.checkoutId = id),
      switchMap(id => this.checkOutService.getCheckout(id))
    );
  }

  returnBook(): void {
    this.checkOutService.returnBook(this.checkoutId).subscribe(() =>
      this.router.navigate(['..'], { relativeTo: this.route })
    );
  }
}