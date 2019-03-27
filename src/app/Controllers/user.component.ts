import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FriendsApiService } from '../Services/FriendsApiService';
import { XiangruiChatUser } from '../Models/XiangruiChatUser';
import { CacheService } from '../Services/CacheService';
import { switchMap,  } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Values } from '../values';
import { HeaderService } from '../Services/HeaderService';
import { MessageService } from '../Services/MessageService';

@Component({
    templateUrl: '../Views/user.html',
    styleUrls: ['../Styles/menu.css',
                '../Styles/button.css',
                '../Styles/badge.css']
})

export class UserComponent implements OnInit {
    public info: XiangruiChatUser;
    public conversationId: number;
    public areFriends: boolean;
    public loadingImgURL = Values.loadingImgURL;
    public isonline = 'false';

    constructor(
        private route: ActivatedRoute,
        private friendsApiService: FriendsApiService,
        private router: Router,
        private cacheService: CacheService,
        private headerService: HeaderService,
        public messageService: MessageService
    ) {
        this.headerService.title = '好友信息';
        this.headerService.returnButton = true;
        this.headerService.button = false;
        this.headerService.shadow = false;
    }

    public ngOnInit(): void {
        this.route.params
            .pipe(switchMap((params: Params) => this.friendsApiService.UserDetail(params['id'])))
            .subscribe(response => {
                this.info = response.user;
                this.conversationId = response.conversationId;
                this.areFriends = response.areFriends;
                this.info.avatarURL = Values.fileAddress + this.info.headImgFileKey;
                this.friendsApiService.FriendIsOnline(this.info.id).subscribe((data) => {
                    this.isonline = data.message.toLowerCase();
                });
            });
    }

    public delete(id: string): void {
        Swal.fire({
            title: '是否要删除这个好友?',
            type: 'warning',
            showCancelButton: true
        }).then((willDelete) => {
            if (willDelete.value) {
                this.friendsApiService.DeleteFriend(id)
                    .subscribe(response => {
                        Swal.fire('成功', response.message, 'success');
                        this.cacheService.autoUpdateConversation();
                        this.router.navigate(['/friends']);
                    });
            }
        });
    }

    public request(id: string): void {
        this.friendsApiService.CreateRequest(id)
            .subscribe(response => {
                if (response.code === 0) {
                    Swal.fire('成功', response.message, 'success');
                } else {
                    Swal.fire('错误', response.message, 'error');
                }
            });
    }

    public report(): void {
        Swal.fire({
            title: '私信',
            input: 'textarea',
            inputPlaceholder: '请输入私信信息...',
            inputAttributes: {
                maxlength: '200'
            },
            showCancelButton: true,
            confirmButtonText: '私信'
          }).then((result) => {
            if (result.value) {
                if (result.value.length >= 5) {
                    this.friendsApiService.Report(this.info.id, result.value).subscribe(response => {
                        if (response.code === 0) {
                            Swal.fire('成功', response.message, 'success');
                        } else {
                            Swal.fire('失败', response.message, 'error');
                        }
                    }, () => {
                        Swal.fire('失败', '私信错误.', 'error');
                    });
                } else {
                    Swal.fire('失败', '举报长度在6-100之间.', 'error');
                }
            }
          });
    }
}
