import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getGoals } from '../../helpers/getGoals'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const logger = createLogger('getGoal')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing Event ', event)
    const toDos = await getGoals(event)
    return {
      statusCode: 200,
      body: JSON.stringify({
        items: toDos
      })
    }
  }
)
handler.use(
  cors({
    credentials: true
  })
)
