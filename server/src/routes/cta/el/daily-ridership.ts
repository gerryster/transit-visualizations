import ctaElDailyRidership from '../../../models/cta/el/daily-ridership.ts';

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export default async function routes(fastify: FastifyInstance, options: Object) {
  fastify.get('/cta/el/daily-ridership', async (request: FastifyRequest, reply: FastifyReply) => {
    const dailyRidership = ctaElDailyRidership.fetch();
    return dailyRidership.toJson();
  })
}
