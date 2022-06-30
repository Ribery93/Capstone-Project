import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import {deleteGoal} from '../../helpers/getGoals'
import {createLogger} from '../../utils/logger'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'

const logger = createLogger('deleteGoal')

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        logger.info('Processing Event ', event)
        const authorization = event.headers.Authorization
        const split = authorization.split(' ')
        const jwtToken = split[1]

        const goalId = event.pathParameters.goalId

        const delGoal = await deleteGoal(goalId, jwtToken)

        return {
            statusCode: 200,
            body: delGoal
        }
    }
)

handler.use(
    cors({
        origin: '*',
        credentials: true
    })
)
