import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Page, PageRequest } from "../models/page";
import { Observable } from "rxjs";
import { RestUtil } from "./rest-util";
import { Checkout } from "../models/Checkout";
import { CheckoutRequest } from "../models/checkout-request";

@Injectable({
    providedIn: 'root'
})
export class CheckoutService {
    private readonly baseUrl = environment.backendUrl + '/api/checkout';

    constructor(
        private http: HttpClient
    ) {}

    getCheckouts(filter: Partial<PageRequest>): Observable<Page<Checkout>> {
        const url = this.baseUrl + '/getCheckouts';
        const params = RestUtil.buildParamsFromPageRequest(filter);
        return this.http.get<Page<Checkout>>(url, {params});
    }

    getCheckout(checkOutId: string): Observable<Checkout> {
        const url = this.baseUrl + '/getCheckout';
        const params = new HttpParams().set('checkOutId', checkOutId);
        return this.http.get<Checkout>(url, {params});
    }

    saveCheckout(checkout: CheckoutRequest): Observable<void> {
        const url = this.baseUrl + '/checkout';
        return this.http.post<void>(
            url,
            checkout
        );
        }
    updateCheckout(checkOutDTO: Checkout): Observable<string> {
        const url = this.baseUrl + '/updateCheckout';
        return this.http.put<string>(url, checkOutDTO);
    }

    returnBook(checkoutId: string): Observable<void> {
        const url = this.baseUrl + '/returnBook';
        const params = new HttpParams().set('bookId', checkoutId);
        return this.http.put<void>(url, null, {params});
    }

    deleteCheckout(checkOutId: string): Observable<string> {
        const url = this.baseUrl + '/checkout';
        const params = new HttpParams().set('checkOutId', checkOutId);
        return this.http.delete<string>(url, {params});
    }
}