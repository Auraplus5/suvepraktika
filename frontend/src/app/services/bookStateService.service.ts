import { Injectable } from "@angular/core";
import { PageRequest } from "../models/page";

@Injectable({
    providedIn: 'root'
})
export class BookStateService {
    pageReq: PageRequest = {
        pageIndex: 0,
        pageSize: 20
    };
    hasSearched: boolean = false;
    searchTitle: string = '';
    selectedStatus: string = '';
}