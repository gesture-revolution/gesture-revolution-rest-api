import { ITag } from '../tag/models.d';

export interface IVideo {
    name: string;
    owner: string;
    url: string;
    tags: ITag[];
}
