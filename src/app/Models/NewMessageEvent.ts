import { AiurEvent } from './AiurEvent';
import { XiangruiChatUser } from './XiangruiChatUser';

export class NewMessageEvent extends AiurEvent {
    public conversationId: number;
    public sender: XiangruiChatUser;
    public content: string;
    public aesKey: string;
    public muted: boolean;
    public sentByMe: boolean;
}
