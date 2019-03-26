import { AiurProtocal } from '../AiurProtocal';
import { XiangruiChatUser } from '../XiangruiChatUser';

export class UserDetailViewModel extends AiurProtocal {
    public user: XiangruiChatUser;
    public areFriends: boolean;
    public conversationId: number;
}
