import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export default async function routes(fastify: FastifyInstance, options: Object) {
  fastify.get('/cta/el/daily-ridership', async (request: FastifyRequest, reply: FastifyReply) => {
    return { total_rides: 42 }
  })
}
