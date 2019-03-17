import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ContactInfo } from '../Models/ContactInfo';
import { Values } from '../values';
import { MessageService } from '../Services/MessageService';
import { CacheService } from '../Services/CacheService';
import { HeaderService } from '../Services/HeaderService';
import Swal from 'sweetalert2';
import { GroupsApiService } from '../Services/GroupsApiService';

@Component({
    templateUrl: '../Views/friends.html',
    styleUrls: [
        '../Styles/friends.css',
        '../Styles/menu.css',
        '../Styles/reddot.css']

})
export class FriendsComponent implements OnInit, OnDestroy {
    public loadingImgURL = Values.loadingImgURL;

    constructor(
        private groupsApiService: GroupsApiService,
        private router: Router,
        private messageService: MessageService,
        public cacheService: CacheService,
        private headerService: HeaderService) {
            this.headerService.title = '通讯录';
            this.headerService.returnButton = false;
            this.headerService.button = true;
            this.headerService.routerLink = '/discover';
            this.headerService.buttonIcon = 'plus';
            this.headerService.shadow = false;
    }
    public ngOnInit(): void {
        this.messageService.updateFriends();
    }

    public detail(info: ContactInfo): void {
        if (info.userId == null) {
            this.router.navigate(['/group', info.conversationId]);
        } else {
            this.router.navigate(['/user', info.userId]);
        }
    }

    public createGroup(): void {
        Swal.fire({
            title: '请输入群聊名称:',
            input: 'text',
            inputAttributes: {
                maxlength: '25'
            },
            html: '<input type="checkbox" id="checkPrivate"><label for="checkPrivate">私有群聊[需要密码]<label>',
            showCancelButton: true,
        }).then(input => {
            if (input.value) {
                if (input.value.includes(' ')) {
                    Swal.fire('请重试', '群聊名称不可以有空格.', 'error');
                    return;
                }
                if (input.value.length < 3 || input.value.length > 25) {
                    Swal.fire('请重试', '群聊名称的长度在 3 - 25之间.', 'error');
                    return;
                }
                if (!(<HTMLInputElement>document.querySelector('#checkPrivate')).checked) {
                    Swal.fire({
                        title: '是否要创建这个群聊?',
                        type: 'question',
                        showCancelButton: true
                    }).then((result) => {
                        if (result.value) {
                            this.createPrivateGroup(input.value, '');
                        }
                    });
                } else {
                    Swal.fire({
                        title: '请输入这个群聊的密码:',
                        input: 'text',
                        inputAttributes: {
                            maxlength: '100'
                        },
                        showCancelButton: true
                    }).then((result) => {
                        if (result.value) {
                            this.createPrivateGroup(input.value, result.value);
                        }
                    });
                }
            }
        });
    }

    private createPrivateGroup(groupName: string, password: string): void {
        this.groupsApiService.CreateGroup(groupName, password).subscribe((response) => {
            if (response.code === 0) {
                this.router.navigate(['/talking', response.value]);
            } else {
                Swal.fire('无法创建群聊', response.message, 'error');
            }
        });
    }

    public ngOnDestroy(): void {
    }
}
