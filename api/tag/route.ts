import { series } from 'async';
import { fmtError, NotFoundError, restCatch } from 'custom-restify-errors';
import { IOrmReq } from 'orm-mw';
import * as restify from 'restify';
import { has_body, mk_valid_body_mw_ignore } from 'restify-validators';
import { JsonSchema } from 'tv4';

import { has_auth } from '../auth/middleware';
import { Tag } from './models';

const slugify: (s: string) => string = require('slugify');

/* tslint:disable:no-var-requires */
const tag_schema: JsonSchema = require('./../../test/api/tag/schema');

const zip = (a0: any[], a1: any[]) => a0.map((x, i) => [x, a1[i]]);

export const create = (app: restify.Server, namespace: string = ''): void => {
    app.post(`${namespace}/:name`, has_auth(),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const tag = new Tag();
            tag.name = slugify(req.params.name.replace('_', '-'));
            // req['user_id'];

            req.getOrm().typeorm.connection.manager
                .save(tag)
                .then((tag_obj: Tag) => {
                    if (tag_obj == null) return next(new NotFoundError('Tag'));
                    res.json(201, tag_obj);
                    return next();
                })
                .catch(restCatch(req, res, next));
        }
    );
};

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:name`, has_auth(),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            req.getOrm().typeorm.connection
                .getRepository(Tag)
                .findOne({ name: req.params.name })
                .then((tag: Tag) => {
                    if (tag == null) return next(new NotFoundError('Tag'));
                    res.json('');
                    return next();
                })
                .catch(restCatch(req, res, next));
        }
    );
};

export const update = (app: restify.Server, namespace: string = ''): void => {
    app.put(`${namespace}/:name_owner`, has_body, has_auth(),
        mk_valid_body_mw_ignore(tag_schema, ['Missing required property']),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const tagR = req.getOrm().typeorm.connection.getRepository(Tag);

            // TODO: Transaction
            series([
                cb =>
                    tagR
                        .update({ name: req.params.name }, req.body)
                        .then(() => cb(void 0))
                        .catch(cb),
                cb =>
                    tagR
                        .findOne(req.body)
                        .then(tag => {
                            if (tag == null) return cb(new NotFoundError('Tag'));
                            return cb();
                        })
                        .catch(cb)
            ], error => {
                if (error != null) return next(fmtError(error));
                res.json(req.body);
                return next();
            });
        }
    );
};

export const del = (app: restify.Server, namespace: string = ''): void => {
    app.del(`${namespace}/:name`, has_auth(),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            req.getOrm().typeorm.connection
                .getRepository(Tag)
                .remove({ owner: req['user_id'], name: req.params.name } as any)
                .then(() => {
                    res.send(204);
                    return next();
                })
                .catch(restCatch(req, res, next));
        }
    );
};
