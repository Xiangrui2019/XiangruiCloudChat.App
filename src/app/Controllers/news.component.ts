import { ApiService } from './../Services/ApiService';
import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../Services/HeaderService';

@Component({
    templateUrl: '../Views/news.html',
    styleUrls: [
        '../Styles/news.css',
        '../Styles/menu.css',
        '../Styles/button.css',
        '../Styles/add-friend.css'
    ]
})

export class NewsComponent implements OnInit {
    public news = [];

    constructor(
        private headerService: HeaderService,
        private apiService: ApiService
    ) {
        this.headerService.title = '新闻';
        this.headerService.returnButton = true;
        this.headerService.button = false;
        this.headerService.shadow = false;
    }

    public updateNews() {
        this.apiService.Get('/News/GetNews').subscribe((data) => {
            for (const newp of data['data']) {
                this.news.push(newp);
                window.scrollTo(0, document.documentElement.clientHeight);
            }
        });
    }

    ngOnInit(): void {
        this.updateNews();
    }
}
