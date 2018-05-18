import { Entity, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm';

import { Video } from '../video/models';

export const _dependencies = ['user'/*, 'video'*/];

@Entity('video_tag_tbl')
export class Tag {
    @PrimaryColumn({ type: 'varchar' })
    name: string;

    @ManyToMany(type => Video, video => video.tags)
    @JoinTable()
    videos: Video;
}
