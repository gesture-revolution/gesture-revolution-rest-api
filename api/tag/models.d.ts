import { IVideo } from '../video/models.d';

export interface ITag {
    name: string;
    videos: IVideo[];
}
