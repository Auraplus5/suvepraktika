import { Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { FavoritesService } from '../../services/favorites.service';
import { CheckoutService } from '../../services/checkout.service';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss']
})
export class BookDetailComponent implements OnInit {
  book$!: Observable<Book>;
  isFavorite = false;
  bookId!: string;

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
    private checkoutService: CheckoutService,
    private favoritesService: FavoritesService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.book$ = this.route.params.pipe(
      map(params => params['id']),
      tap(id => {
        this.bookId = id;
        this.isFavorite = this.favoritesService.isFavorite(id);
      }),
      switchMap(id => this.bookService.getBook(id))
    );
  }

  toggleFavorite(): void {
    this.isFavorite = this.favoritesService.toggle(this.bookId);
  }

  checkOut(book: Book): void {
  const ref = this.dialog.open(ConfirmDialogComponent, {
    data: {
      title: 'Check out book',
      message: `Check out "${book.title}"? It will be due in 14 days.`,
      confirmLabel: 'Check out'
    }
  });

  ref.afterClosed().subscribe(confirmed => {
    if (!confirmed) {
      return;
    }

    this.checkoutService.saveCheckout({
      borrowedBookId: book.id,
      borrowerFirstName: 'Current',
      borrowerLastName: 'User'
    }).subscribe({
      next: () => {
        this.router.navigate(['/checkouts']);
      },
      error: error => {
        console.error('Checkout failed', error);
      }
    });
  });
}

  deleteBook(book: Book): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete book',
        message: `Permanently delete "${book.title}"? This cannot be undone.`,
        confirmLabel: 'Delete'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.bookService.deleteBook(book.id).subscribe(() =>
        this.router.navigate(['/books'])
      );
    });
  }

  return(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}