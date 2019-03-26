import { UserGroupRelation } from './XiangruiChatUsers';

export class Conversation {
    public id: number;
    public discriminator: string;
    public conversationCreateTime: Date;
    public displayName: string;
    public displayImageKey: number;
    public anotherUserId: string;
    public aesKey: string;
    public users: UserGroupRelation[];
    public avatarURL: string;
}
