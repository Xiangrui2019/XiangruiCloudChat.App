import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class HeaderService {
    public title = '祥瑞云易信';
    public returnButton = true;
    public button = false;
    public routerLink = '';
    public buttonIcon = '';
    public shadow = false;
}
