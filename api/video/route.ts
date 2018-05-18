import { series } from 'async';
import { fmtError, NotFoundError, restCatch } from 'custom-restify-errors';
import { IOrmReq } from 'orm-mw';
import * as restify from 'restify';
import { has_body, mk_valid_body_mw_ignore } from 'restify-validators';
import { JsonSchema } from 'tv4';

import { has_auth } from '../auth/middleware';
import { Video } from './models';

const slugify: (s: string) => string = require('slugify');

/* tslint:disable:no-var-requires */
const video_schema: JsonSchema = require('./../../test/api/video/schema');

const zip = (a0: any[], a1: any[]) => a0.map((x, i) => [x, a1[i]]);

export const create = (app: restify.Server, namespace: string = ''): void => {
    app.post(`${namespace}/:name`, has_auth(), mk_valid_body_mw_ignore(video_schema,  ['Missing required property']),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const video = new Video();
            Object.keys(req.body).forEach(k => video[k] = req.body[k]);
            video.name = slugify(req.params.name.replace('_', '-'));
            video.owner = req['user_id'];
            console.info('create::video =', video, ';');

            req.getOrm().typeorm.connection.manager
                .save(video)
                .then((video_obj: Video) => {
                    if (video_obj == null) return next(new NotFoundError('Video'));
                    res.json(201, video_obj);
                    return next();
                })
                .catch(restCatch(req, res, next));
        }
    );
};

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:name`, has_auth(),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const header = ['date', 'user', 'content'];
            req.getOrm().typeorm.connection
                .getRepository(Video)
                .findOne({ name: req.params.name })
                .then((video: Video) => {
                    if (video == null) return next(new NotFoundError('Video'));
                    res.json(video);
                    return next();
                })
                .catch(restCatch(req, res, next));
        }
    );
};

export const update = (app: restify.Server, namespace: string = ''): void => {
    app.put(`${namespace}/:name_owner`, has_body, has_auth(),
        mk_valid_body_mw_ignore(video_schema, ['Missing required property']),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const videoR = req.getOrm().typeorm.connection.getRepository(Video);

            // TODO: Transaction
            series([
                cb =>
                    videoR
                        .update({ name: req.params.name, owner: req['user_id'] }, req.body)
                        .then(() => cb(void 0))
                        .catch(cb),
                cb =>
                    videoR
                        .findOne(req.body)
                        .then(video => {
                            if (video == null) return cb(new NotFoundError('Video'));
                            return cb();
                        })
                        .catch(cb)
            ], error => {
                if (error != null) return next(fmtError(error));
                res.json(200, req.body);
                return next();
            });
        }
    );
};

export const del = (app: restify.Server, namespace: string = ''): void => {
    app.del(`${namespace}/:name`, has_auth(),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            req.getOrm().typeorm.connection
                .getRepository(Video)
                .remove({ owner: req['user_id'], name: req.params.name } as any)
                .then(() => {
                    res.send(204);
                    return next();
                })
                .catch(restCatch(req, res, next));
        }
    );
};
