import { IVideo } from '../../../api/video/models.d';

export const video_mocks: {successes: IVideo[], failures: Array<{}>} = {
    failures: [
        {},
        { nom: false },
        { name: 'foo', bad_prop: true }
    ],
    successes:
        Array(5)
            .fill(null)
            .map((o, i) => console.info('o', o, 'i', i, ';') || ({
                name: `chosen-${Math.floor(Math.random() * 1000)}`,
                owner: (i & 1) === 0 ? 'bar' : 'foo',
                url: (i & 1) === 0 ? 'url0' : 'url1',
                tags: (i & 1) === 0 ?
                    [{ name: '80s', videos: [] }, { name: 'punk', videos: [] }]
                    : [{ name: '90s', videos: [] }, { name: 'rock', videos: [] }]
            }))
            .map((video: IVideo, idx, arr) => {
                arr.forEach((v,i) => video.tags.forEach(t => t.videos.push(video)));
                console.info('video =', video, ';');
                return video;
            }) as IVideo[]
    // TODO: populate videos array
};

if (require.main === module) {
    /* tslint:disable:no-console */
    console.info(video_mocks);
}
