import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import {getGoals} from '../../helpers/getGoals'
import {createLogger} from '../../utils/logger'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'

const logger = createLogger('getGoal')

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        logger.info('Processing Event ', event)
        const toDos = await getGoals(event)
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
                'Access-Control-Allow-Headers': 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',

            },
            body: JSON.stringify({
                items: toDos
            })
        }
    }
)
handler.use( cors())
