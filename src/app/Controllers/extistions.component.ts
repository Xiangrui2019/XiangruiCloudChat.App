import Swal from 'sweetalert2';
import { Component, OnInit } from '@angular/core';
import { HeaderService } from './../Services/HeaderService';
import { HomeApiService } from '../Services/HomeApiService';

@Component({
    templateUrl: '../Views/extistions.html',
    styleUrls: ['../Styles/menu.css',
                '../Styles/button.css',
                '../Styles/badge.css',
                '../Styles/extistions.css']
})

export class ExtistionsComponent implements OnInit {
    public sharefriendsmessage = '';

    constructor(
        private headerService: HeaderService,
        private homeApiService: HomeApiService
    ) {
        this.headerService.title = '拓展功能';
        this.headerService.returnButton = false;
        this.headerService.button = false;
        this.headerService.shadow = false;
    }

    ngOnInit(): void {
        this.firstshare();
    }

    public firstshare() {
        // tslint:disable-next-line:max-line-length
        this.sharefriendsmessage = `您好, 您的好友推荐您使用祥瑞云易信, 已获得更加优秀的安全通信和用户体验. 请使用Chrome Firefox打开 http://t.cn/EJPUpCN 使用.`;
    }

    public share() {
        Swal.fire('成功', '我们已经把文字复制到了您的剪贴板, 请粘贴到短信或其他渠道发送给您的好友!', 'success');
    }

    public pingnetwork(): void {
        const success = (_data) => {
            Swal.fire('很棒', '您的网络连接正常', 'success');
        };
        const error = (_err) => {
            Swal.fire('错误', '您的网络连接出现了问题', 'error');
        };
        this.homeApiService.Ping().subscribe(success, error);
    }
}
