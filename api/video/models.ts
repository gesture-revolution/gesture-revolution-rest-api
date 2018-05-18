import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';

import { Tag } from '../tag/models';

export const _dependencies = ['user', 'tag'];

@Entity('video_tbl')
export class Video {
    @PrimaryColumn({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar' })
    owner: string; // channel or user

    @Column({ type: 'varchar' })
    url: string;

    @ManyToMany(type => Tag, tag => tag.videos)
    tags: Tag[];
}
