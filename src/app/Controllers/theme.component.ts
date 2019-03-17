import { Component, OnInit, ElementRef } from '@angular/core';
import { HeaderService } from '../Services/HeaderService';
import { Themes } from '../Models/Themes';

@Component({
    templateUrl: '../Views/theme.html',
    styleUrls: ['../Styles/menu.css'],
})
export class ThemeComponent implements OnInit {
    constructor(
        private headerService: HeaderService,
        private elementRef: ElementRef
    ) {
        this.headerService.title = '主题颜色';
        this.headerService.returnButton = true;
        this.headerService.button = false;
        this.headerService.shadow = false;
    }

    currentTheme: Themes = Themes.light;

    ngOnInit(): void {
         const localSet = localStorage.getItem('setting-theme');
         if (localSet != null) {
             this.currentTheme = parseInt(localSet, 10) as Themes;
         }
    }

    changeTheme(themeId: Number) {
        const theme = themeId as Themes;
        if (this.currentTheme === theme) { return; }
        this.currentTheme = theme;
        localStorage.setItem('setting-theme', this.currentTheme.toString());
        switch (theme) {
            case Themes.light:
            this.elementRef.nativeElement.ownerDocument.body.className = 'theme-light';
            break;
            case Themes.dark:
            this.elementRef.nativeElement.ownerDocument.body.className = 'theme-dark';
            break;
        }
    }
}
