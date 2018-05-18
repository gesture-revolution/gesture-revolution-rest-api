import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiJsonSchema from 'chai-json-schema';
import { IncomingMessageError, sanitiseSchema, superEndCb, TCallback } from 'nodejs-utils';
import * as supertest from 'supertest';
import { Response } from 'supertest';

import { ITag } from '../../../api/tag/models.d';
import * as tag_route from '../../../api/tag/route';
import * as tag_routes from '../../../api/tag/routes';
import { User } from '../../../api/user/models';

/* tslint:disable:no-var-requires */
const user_schema = sanitiseSchema(require('./../user/schema.json'), User._omit);
const tag_schema = require('./schema.json');

chai.use(chaiJsonSchema);

export class TagTestSDK {
    constructor(public app) {
    }

    public create(access_token: string, tag: ITag,
                  callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null) return callback(new TypeError('`access_token` argument to `create` must be defined'));
        else if (tag == null) return callback(new TypeError('`tag` argument to `create` must be defined'));

        expect(tag_route.create).to.be.an.instanceOf(Function);
        supertest(this.app)
            .post(`/api/tag/${tag.name}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .expect('Content-Type', /json/)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err);
                else if (res.error != null) return superEndCb(callback)(res.error);

                try {
                    expect(res.status).to.be.equal(201);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.be.jsonSchema(tag_schema);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    superEndCb(callback)(err, res);
                }
            });
    }

    public getAll(access_token: string, tag: ITag,
                  callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null) return callback(new TypeError('`access_token` argument to `getAll` must be defined'));
        else if (tag == null) return callback(new TypeError('`tag` argument to `getAll` must be defined'));

        expect(tag_routes.read).to.be.an.instanceOf(Function);
        supertest(this.app)
            .get('/api/tag')
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err);
                else if (res.error != null) return superEndCb(callback)(res.error);
                try {
                    expect(res.body).to.have.property('owner');
                    expect(res.body).to.have.property('tags');
                    expect(res.body.tags).to.be.instanceOf(Array);
                    res.body.tags.map(_tag => {
                        expect(_tag).to.be.an('object');
                        expect(_tag).to.be.jsonSchema(tag_schema);
                    });
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    superEndCb(callback)(err, res);
                }
            });
    }

    public retrieve(access_token: string, tag: ITag,
                    callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null) return callback(new TypeError('`access_token` argument to `getAll` must be defined'));
        else if (tag == null) return callback(new TypeError('`tag` argument to `getAll` must be defined'));

        expect(tag_route.read).to.be.an.instanceOf(Function);
        console.info('`/api/tag/${tag.name}` =', `/api/tag/${tag.name}`)
        supertest(this.app)
            .get(`/api/tag/${tag.name}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err);
                else if (res.error != null) return superEndCb(callback)(res.error);
                try {
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.be.jsonSchema(tag_schema);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    superEndCb(callback)(err, res);
                }
            });
    }

    public update(access_token: string, initial_tag: ITag,
                  updated_tag: ITag, callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null)
            return callback(new TypeError('`access_token` argument to `update` must be defined'));
        else if (initial_tag == null)
            return callback(new TypeError('`initial_tag` argument to `update` must be defined'));
        else if (updated_tag == null)
            return callback(new TypeError('`updated_tag` argument to `update` must be defined'));

        expect(tag_route.update).to.be.an.instanceOf(Function);
        supertest(this.app)
            .put(`/api/tag/${initial_tag.name}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .send(updated_tag)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err);
                else if (res.error != null) return superEndCb(callback)(res.error);
                try {
                    expect(res.body).to.be.an('object');
                    Object.keys(updated_tag).map(
                        attr => expect(updated_tag[attr]).to.be.equal(res.body[attr])
                    );
                    expect(res.body).to.be.jsonSchema(tag_schema);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    superEndCb(callback)(err, res);
                }
            });
    }

    public destroy(access_token: string, tag: ITag,
                   callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null)
            return callback(new TypeError('`access_token` argument to `destroy` must be defined'));
        else if (tag == null)
            return callback(new TypeError('`tag` argument to `destroy` must be defined'));

        expect(tag_route.del).to.be.an.instanceOf(Function);
        supertest(this.app)
            .del(`/api/tag/${tag.name}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err);
                else if (res.error != null) return superEndCb(callback)(res.error);
                try {
                    expect(res.status).to.be.equal(204);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    superEndCb(callback)(err, res);
                }
            });
    }
}
