import * as async from 'async';
import { createLogger } from 'bunyan';
import { IModelRoute, model_route_to_map } from 'nodejs-utils';
import { IOrmsOut, tearDownConnections } from 'orm-mw';
import { basename } from 'path';
import { Server } from 'restify';

import { AccessToken } from '../../../api/auth/models';
import { ITag } from '../../../api/tag/models.d';
import { _orms_out } from '../../../config';
import { all_models_and_routes_as_mr, setupOrmApp } from '../../../main';
import { create_and_auth_users } from '../../shared_tests';
import { AuthTestSDK } from '../auth/auth_test_sdk';
import { user_mocks } from '../user/user_mocks';
import { User } from '../../../api/user/models';
import { tag_mocks } from './tag_mocks';
import { TagTestSDK } from './tag_test_sdk';

const models_and_routes: IModelRoute = {
    user: all_models_and_routes_as_mr['user'],
    auth: all_models_and_routes_as_mr['auth'],
    video: all_models_and_routes_as_mr['video'],
    tag: all_models_and_routes_as_mr['tag']
};

process.env['NO_SAMPLE_DATA'] = 'true';
export const user_mocks_subset: User[] = user_mocks.successes.slice(20, 30);

const tapp_name = `test::${basename(__dirname)}`;
const logger = createLogger({ name: tapp_name });

describe('Tag::routes', () => {
    let sdk: TagTestSDK;
    let auth_sdk: AuthTestSDK;

    const mocks: {successes: ITag[], failures: Array<{}>} = tag_mocks;

    before(done =>
        async.waterfall([
                cb => tearDownConnections(_orms_out.orms_out, e => cb(e)),
                cb => AccessToken.reset() || cb(void 0),
                cb => setupOrmApp(
                    model_route_to_map(models_and_routes), { logger },
                    { skip_start_app: true, app_name: tapp_name, logger },
                    cb
                ),
                (_app: Server, orms_out: IOrmsOut, cb) => {
                    _orms_out.orms_out = orms_out;

                    auth_sdk = new AuthTestSDK(_app);
                    sdk = new TagTestSDK(_app);

                    return cb(void 0);
                },
                cb => create_and_auth_users(user_mocks_subset, auth_sdk, cb)
            ],
            done
        )
    );

    after('unregister all users', done => auth_sdk.unregister_all(user_mocks_subset, done));
    after('tearDownConnections', done => tearDownConnections(_orms_out.orms_out, done));

    describe('/api/tag', () => {
        afterEach('deleteTag', done =>
            async.series([
                cb => sdk.destroy(user_mocks_subset[0].access_token, mocks.successes[0], () => cb()),
                cb => sdk.destroy(user_mocks_subset[0].access_token, mocks.successes[1], () => cb())
            ], done)
        );

        it('POST should create tag', done => {
            sdk.create(user_mocks_subset[0].access_token, mocks.successes[0], done)
        });

        it('GET should get all tags', done => async.series([
                cb => sdk.create(user_mocks_subset[0].access_token, mocks.successes[1], cb),
                cb => sdk.getAll(user_mocks_subset[0].access_token, mocks.successes[0], cb)
            ], done)
        );
    });

    describe('/api/tag/:name', () => {
        before('createTag', done => {
            sdk.create(user_mocks_subset[0].access_token, mocks.successes[2], done);
        });
        after('deleteTag', done => {
            sdk.destroy(user_mocks_subset[0].access_token, mocks.successes[2], done)
        });

        it('GET should retrieve tag', done => {
            sdk.retrieve(user_mocks_subset[0].access_token, mocks.successes[2], done)
        });

        /*
        it('PUT should update tag', done =>
            sdk.update(user_mocks_subset[0].access_token, mocks.successes[2],
                {
                    owner: mocks.successes[1].owner,
                    name: `NAME: ${mocks.successes[1].name}`
                } as ITag, done)
        );
        */

        /*
        it('DELETE should destroy tag', done =>
            sdk.destroy(user_mocks_subset[0].access_token, mocks.successes[2], done)
        );
        */
    });
});
