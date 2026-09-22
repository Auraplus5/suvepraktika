import { Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book.service';
import { debounceTime, distinctUntilChanged, Observable, of, Subject, switchMap, tap, map } from 'rxjs';
import { Page, PageRequest } from '../../models/page';
import { Book } from '../../models/book';
import { BookStateService } from 'src/app/services/bookStateService.service';
import { FavoritesService } from 'src/app/services/favorites.service';

@Component({
  selector: 'app-books-list',
  templateUrl: './books-list.component.html',
  styleUrls: ['./books-list.component.scss']
})
export class BooksListComponent implements OnInit {
  hasSearched: boolean = false;
  displayedColumns: string[] = ['favorite', 'title', 'author','status', 'details']
  currentPageSize = 20;
  currentPage?: Page<Book>
  options: string[] = ['AVAILABLE', 'BORROWED', 'RETURNED', 'DAMAGED', 'PROCESSING'];
  suggestions: string[] = [];

  books$!: Observable<Page<Book>>;
  private titleInput$ = new Subject<string>();
  showingFavorites = false;

  constructor(
    private bookService: BookService,
    private bookStateService: BookStateService,
    public favoritesService: FavoritesService
  ) {
  }

  ngOnInit(): void {
    // TODO this observable should emit books taking into consideration pagination, sorting and filtering options.
    this.loadBooks(this.bookStateService.pageReq);
    this.titleInput$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(title => title.length >= 2 ? this.bookService.getSuggestions(title) : of([]))
    ).subscribe(titles => this.suggestions = titles);
  }

  loadBooks(filter: Partial<PageRequest>): void {
  this.bookStateService.pageReq = { ...this.bookStateService.pageReq, ...filter };
  this.books$ = this.bookService.getBooks(this.bookStateService.pageReq).pipe(
    tap(page => {
      this.currentPage = page;
      this.bookStateService.pageReq = { ...this.bookStateService.pageReq, pageIndex: page.number };
    }),
    map(page => {
      if (!this.showingFavorites) return page;
      const ids = this.favoritesService.getAll();
      return { ...page, content: page.content.filter(b => ids.includes(b.id)) };
    })
  );
}

  next(): void {
    if(this.hasNext()) {
      this.loadBooks({pageIndex: this.bookStateService.pageReq.pageIndex + 1});
    }
  }

  back(): void {
    if(this.hasPrevious()) {
      this.loadBooks({pageIndex: this.bookStateService.pageReq.pageIndex - 1});
    }
  }

    toggleFavorite(bookId: string): void {
    this.favoritesService.toggle(bookId);
  }

  toggleFavoritesFilter(): void {
    this.showingFavorites = !this.showingFavorites;
    // favorites are local-only so filter client-side after loading
    this.loadBooks({ pageIndex: 0 });
  }

  sort(element: string): void {
    if (element !== this.bookStateService.pageReq.sort) {
      this.loadBooks({pageIndex: 0, sort: element, direction: 'asc'})
    } else {
        const direction = this.bookStateService.pageReq.direction === 'asc' ? 'desc' : 'asc';
        this.loadBooks({pageIndex: 0, sort: element, direction: direction})
    }
  }

  reset(): void {
    this.bookStateService.pageReq = {pageIndex: 0, pageSize: this.currentPageSize};
    this.hasSearched = false;
    this.loadBooks(this.bookStateService.pageReq);
  }

  hasNext(): boolean {
    return this.currentPage?.number !== undefined && this.currentPage.number < (this.currentPage?.totalPages ?? 0) - 1;
  }

  hasPrevious(): boolean {
    return this.currentPage?.number !== undefined && this.currentPage.number > 0;
  }

  onTitleInput(value: string): void {
    this.titleInput$.next(value);
    if (!value && this.hasSearched) {
      this.suggestions = [];
      this.search(undefined);
      this.hasSearched = false;
    }
  }

  selectSuggestion(title: string): void {
    this.suggestions = [];
    this.search(title);
    this.hasSearched = true;
  }

  search(title: string | undefined): void {
    this.loadBooks({pageIndex: 0, title: title})
  }
  
  getBooksByStatus(status: string) {
   this.loadBooks({pageIndex: 0, status: status})
  }

}
