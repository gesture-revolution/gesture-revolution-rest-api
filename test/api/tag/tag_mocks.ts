import { ITag } from '../../../api/tag/models.d';
import { video_mocks } from '../video/video_mocks';

export const tag_mocks: {successes: ITag[], failures: Array<{}>} = {
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
                videos: video_mocks.successes
            })) as ITag[]
};

if (require.main === module) {
    /* tslint:disable:no-console */
    console.info(tag_mocks);
}
