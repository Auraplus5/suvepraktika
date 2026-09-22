import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly KEY = 'favorite_books';

  getAll(): string[] {
    return JSON.parse(localStorage.getItem(this.KEY) ?? '[]');
  }

  isFavorite(bookId: string): boolean {
    return this.getAll().includes(bookId);
  }

  toggle(bookId: string): boolean {
    const favorites = this.getAll();
    const index = favorites.indexOf(bookId);
    if (index === -1) {
      favorites.push(bookId);
    } else {
      favorites.splice(index, 1);
    }
    localStorage.setItem(this.KEY, JSON.stringify(favorites));
    return index === -1;
  }
}