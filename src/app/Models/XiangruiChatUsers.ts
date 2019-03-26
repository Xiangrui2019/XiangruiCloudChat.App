import { XiangruiChatUser } from './XiangruiChatUser';

export class UserGroupRelation {
    public groupId: number;
    public id: number;
    public joinTime: Date;
    public readTimeStamp: string;
    public user: XiangruiChatUser;
    public userId: string;
    public muted: boolean;
}
