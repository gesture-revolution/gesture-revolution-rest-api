import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiJsonSchema from 'chai-json-schema';
import { IncomingMessageError, sanitiseSchema, superEndCb, TCallback } from 'nodejs-utils';
import * as supertest from 'supertest';
import { Response } from 'supertest';

import { IVideo } from '../../../api/video/models.d';
import * as video_route from '../../../api/video/route';
import * as video_routes from '../../../api/video/routes';
import { User } from '../../../api/user/models';

/* tslint:disable:no-var-requires */
const user_schema = sanitiseSchema(require('./../user/schema.json'), User._omit);
const video_schema = require('./schema.json');

chai.use(chaiJsonSchema);

export class VideoTestSDK {
    constructor(public app) {
    }

    public create(access_token: string, video: IVideo,
                  callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null) return callback(new TypeError('`access_token` argument to `create` must be defined'));
        else if (video == null) return callback(new TypeError('`video` argument to `create` must be defined'));

        expect(video_route.create).to.be.an.instanceOf(Function);
        supertest(this.app)
            .post(`/api/video/${video.name}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .expect('Content-Type', /json/)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err);
                else if (res.error != null) return superEndCb(callback)(res.error);

                try {
                    expect(res.status).to.be.equal(201);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.be.jsonSchema(video_schema);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    superEndCb(callback)(err, res);
                }
            });
    }

    public getAll(access_token: string, video: IVideo,
                  callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null) return callback(new TypeError('`access_token` argument to `getAll` must be defined'));
        else if (video == null) return callback(new TypeError('`video` argument to `getAll` must be defined'));

        expect(video_routes.read).to.be.an.instanceOf(Function);
        supertest(this.app)
            .get('/api/video')
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err);
                else if (res.error != null) return superEndCb(callback)(res.error);
                try {
                    expect(res.body).to.have.property('owner');
                    expect(res.body).to.have.property('videos');
                    expect(res.body.videos).to.be.instanceOf(Array);
                    res.body.videos.map(_video => {
                        expect(_video).to.be.an('object');
                        expect(_video).to.be.jsonSchema(video_schema);
                    });
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    superEndCb(callback)(err, res);
                }
            });
    }

    public retrieve(access_token: string, video: IVideo,
                    callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null) return callback(new TypeError('`access_token` argument to `getAll` must be defined'));
        else if (video == null) return callback(new TypeError('`video` argument to `getAll` must be defined'));

        expect(video_route.read).to.be.an.instanceOf(Function);
        console.info('`/api/video/${video.name}` =', `/api/video/${video.name}`)
        supertest(this.app)
            .get(`/api/video/${video.name}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err);
                else if (res.error != null) return superEndCb(callback)(res.error);
                try {
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.be.jsonSchema(video_schema);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    superEndCb(callback)(err, res);
                }
            });
    }

    public update(access_token: string, initial_video: IVideo,
                  updated_video: IVideo, callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null)
            return callback(new TypeError('`access_token` argument to `update` must be defined'));
        else if (initial_video == null)
            return callback(new TypeError('`initial_video` argument to `update` must be defined'));
        else if (updated_video == null)
            return callback(new TypeError('`updated_video` argument to `update` must be defined'));
        else if (initial_video.owner !== updated_video.owner)
            return callback(
                new ReferenceError(`${initial_video.owner} != ${updated_video.owner} (\`owner\`s between videos)`)
            );

        expect(video_route.update).to.be.an.instanceOf(Function);
        supertest(this.app)
            .put(`/api/video/${initial_video.name}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .send(updated_video)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err);
                else if (res.error != null) return superEndCb(callback)(res.error);
                try {
                    expect(res.body).to.be.an('object');
                    Object.keys(updated_video).map(
                        attr => expect(updated_video[attr]).to.be.equal(res.body[attr])
                    );
                    expect(res.body).to.be.jsonSchema(video_schema);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    superEndCb(callback)(err, res);
                }
            });
    }

    public destroy(access_token: string, video: IVideo,
                   callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null)
            return callback(new TypeError('`access_token` argument to `destroy` must be defined'));
        else if (video == null)
            return callback(new TypeError('`video` argument to `destroy` must be defined'));

        expect(video_route.del).to.be.an.instanceOf(Function);
        supertest(this.app)
            .del(`/api/video/${video.name}`)
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
