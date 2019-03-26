import { XiangruiChatUser } from './XiangruiChatUser';

export class Request {
    public id: number;
    public creatorId: string;
    public creator: XiangruiChatUser;
    public targetId: string;
    public createTime: Date;
    public completed: boolean;
}
