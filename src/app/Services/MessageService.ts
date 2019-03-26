import { Injectable } from '@angular/core';
import { EventType } from '../Models/EventType';
import { AiurEvent } from '../Models/AiurEvent';
import Swal from 'sweetalert2';
import { NewMessageEvent } from '../Models/NewMessageEvent';
import { Conversation } from '../Models/Conversation';
import { Message } from '../Models/Message';
import { ConversationApiService } from './ConversationApiService';
import { map } from 'rxjs/operators';
import { UploadService } from './UploadService';
import { XiangruiChatUser } from '../Models/XiangruiChatUser';
import { AES, enc } from 'crypto-js';
import { CacheService } from './CacheService';
import * as he from 'he';
import Autolinker from 'autolinker';
import { Values } from '../values';
import { ElectronService } from 'ngx-electron';

@Injectable({
    providedIn: 'root'
})

export class MessageService {
    public conversation: Conversation;
    public localMessages: Message[] = [];
    public noMoreMessages = false;
    public loadingMore = false;
    public belowWindowPercent = 0;
    public newMessages = false;
    private oldOffsetHeight: number;
    public maxImageWidth = 0;
    public me: XiangruiChatUser;

    constructor(
        private conversationApiService: ConversationApiService,
        private uploadService: UploadService,
        private cacheService: CacheService,
        private _electronService: ElectronService
    ) {}

    public OnMessage(data: MessageEvent) {
        const ev = JSON.parse(data.data) as AiurEvent;
        switch (ev.type) {
            case EventType.NewMessage:
                const evt = ev as NewMessageEvent;
                if (this.conversation && this.conversation.id === evt.conversationId) {
                    this.getMessages(true, this.conversation.id, -1, 1);
                    if (!document.hasFocus()) {
                        this.showNotification(evt);
                    }
                } else {
                    this.cacheService.autoUpdateConversation();
                    this.showNotification(evt);
                }
                break;
            case EventType.NewFriendRequest:
                Swal.fire('好友请求', '您有一个新的好友请求!', 'info');
                this.cacheService.autoUpdateRequests();
                break;
            case EventType.WereDeletedEvent:
                Swal.fire('已经删除', '您的一个好友删除了您!.', 'info');
                this.cacheService.autoUpdateConversation();
                break;
            case EventType.FriendAcceptedEvent:
                Swal.fire('好友请求', '您的好友请求已经被同意!', 'success');
                this.cacheService.autoUpdateConversation();
                break;
        }
    }

    public getMessages(getDown: boolean, id: number, skipTill: number, take: number): void {
        this.conversationApiService.GetMessage(id, skipTill, take)
            .pipe(
                map(t => t.items)
            )
            .subscribe(messages => {
                if (!this.conversation) {
                    return;
                }
                messages.forEach(t => {
                    try {
                        t.content = AES.decrypt(t.content, this.conversation.aesKey).toString(enc.Utf8);
                    } catch (error) {
                        t.content = '';
                    }
                    if (t.content.match(/^\[(video|img)\].*/)) {
                        const fileKey = this.uploadService.getFileKey(t.content);
                        if (fileKey === -1 || isNaN(fileKey)) {
                            t.content = '';
                        } else if (t.content.startsWith('[img]')) {
                            let imageWidth = Number(t.content.split('-')[2]), imageHeight = Number(t.content.split('-')[1]);
                            if (t.content.substring(5).split('-')[3] === '6' || t.content.substring(5).split('-')[3] === '8' ||
                                t.content.substring(5).split('-')[3] === '5' || t.content.substring(5).split('-')[3] === '7') {
                                [imageWidth, imageHeight] = [imageHeight, imageWidth];
                            }
                            const ratio = imageHeight / imageWidth * 100;
                            if (this.maxImageWidth < imageWidth) {
                                imageWidth = this.maxImageWidth;
                                imageHeight = Math.floor(this.maxImageWidth * ratio / 100);
                            }
                            const displayWidth = imageWidth;
                            if (t.content.substring(5).split('-')[3] === '6' || t.content.substring(5).split('-')[3] === '8' ||
                                t.content.substring(5).split('-')[3] === '5' || t.content.substring(5).split('-')[3] === '7') {
                                [imageWidth, imageHeight] = [imageHeight, imageWidth];
                            }
                            t.content = '[img]' + Values.fileAddress + t.content.substring(5).split('-')[0] + '?w=' + imageWidth +
                                '&h=' + imageHeight + '-' + displayWidth + '-' + ratio + '-' +
                                this.getOrientationClassName(t.content.substring(5).split('-')[3]);
                        }
                    } else if (t.content.match(/^\[(file|audio)\].*/)) {
                        const fileKey = this.uploadService.getFileKey(t.content);
                        if (fileKey === -1 || isNaN(fileKey)) {
                            t.content = '';
                        }
                    } else {
                        t.content = he.encode(t.content);
                        t.content = Autolinker.link(t.content, {
                            stripPrefix: false,
                            className : 'chat-inline-link'
                        });
                    }
                });
                if (messages.length < take) {
                    this.noMoreMessages = true;
                }
                if (this.localMessages.length > 0 && messages.length > 0) {
                    if (this.me && messages[messages.length - 1].senderId !== this.me.id && take === 1 && this.belowWindowPercent > 0) {
                        this.newMessages = true;
                    } else {
                        this.newMessages = false;
                    }
                }
                if (skipTill === -1) {
                    if (take === 1 && messages[0].senderId === this.me.id && !messages[0].content.match(/^\[(img|file|video|audio)\].*/)) {
                        for (let index = 0; index < this.localMessages.length; index++) {
                            if (this.localMessages[index].local) {
                                this.localMessages[index] = messages[0];
                                break;
                            }
                        }
                    } else {
                        this.localMessages.push(...messages);
                    }
                } else {
                    this.localMessages.unshift(...messages);
                }
                if (getDown && this.belowWindowPercent <= 0.2) {
                    setTimeout(() => {
                        this.uploadService.scrollBottom(true);
                    }, 0);
                } else if (!getDown) {
                    this.loadingMore = false;
                    setTimeout(() => {
                        window.scroll(0, document.documentElement.offsetHeight - this.oldOffsetHeight);
                    }, 0);
                }
            });
    }

    public updateBelowWindowPercent(): void {
        this.belowWindowPercent = (document.documentElement.offsetHeight - document.documentElement.scrollTop
            - window.innerHeight) / window.innerHeight;
    }

    public loadMore(): void {
        if (!this.noMoreMessages) {
            this.loadingMore = true;
            this.oldOffsetHeight = document.documentElement.offsetHeight;
            this.getMessages(false, this.conversation.id, this.localMessages[0].id, 15);
        }
    }

    public updateFriends(): void {
        this.cacheService.autoUpdateFriends();
        this.cacheService.autoUpdateRequests();
    }

    public updateMaxImageWidth(): void {
        this.maxImageWidth = Math.floor((window.innerWidth - 40) * 0.7 - 20 - 2);
    }

    public resetVariables(): void {
        this.conversation = null;
        this.localMessages = [];
        this.noMoreMessages = false;
        this.loadingMore = false;
        this.belowWindowPercent = 0;
        this.newMessages = false;
        this.oldOffsetHeight = 0;
        this.maxImageWidth = 0;
    }

    private getOrientationClassName(exifValue: string): string {
        switch (exifValue) {
            case '0':
            case '1':
                return '';
            case '2':
                return 'flip';
            case '3':
                return 'bottom_right';
            case '4':
                return 'flip_bottom_right';
            case '5':
                return 'flip_right_top';
            case '6':
                return 'right_top';
            case '7':
                return 'flip_left_bottom';
            case '8':
                return 'left_bottom';
            default:
                return '';
        }
    }

    private showNotification(event: NewMessageEvent): void {
        if (!event.muted && event.sender.id !== this.me.id && this._electronService.isElectronApp) {
            event.content = AES.decrypt(event.content, event.aesKey).toString(enc.Utf8);
            event.content = this.cacheService.modifyMessage(event.content);
            const notify = new Notification(event.sender.nickName, {
                body: event.content,
                icon: Values.fileAddress + event.sender.headImgFileKey
            });
            notify.onclick = function(clickEvent) {
                clickEvent.preventDefault();
                window.focus();
            };
        }
    }
}
