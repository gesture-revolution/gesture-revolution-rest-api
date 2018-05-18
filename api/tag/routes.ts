import { NotFoundError, restCatch } from 'custom-restify-errors';
import { IOrmReq } from 'orm-mw';
import * as restify from 'restify';
import { JsonSchema } from 'tv4';

import { has_auth } from '../auth/middleware';
import { Tag } from './models';

/* tslint:disable:no-var-requires */
const video_schema: JsonSchema = require('./../../test/api/video/schema');

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(namespace, has_auth(),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            req.getOrm().typeorm.connection
                .getRepository(Tag)
                .find()
                .then((tags: Tag[]) => {
                    if (tags == null || !tags.length) return next(new NotFoundError('Tag'));
                    res.json({ tags });
                    return next();
                })
                .catch(restCatch(req, res, next));
        }
    );
};
