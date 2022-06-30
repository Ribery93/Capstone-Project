import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import {UpdateGoalRequest} from '../../requests/UpdateGoalRequest'
import {updateGoal} from '../../helpers/getGoals'

import * as middy from 'middy'
import {cors} from 'middy/middlewares'

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        console.log('Processing Event ', event)
        const authorization = event.headers.Authorization
        const split = authorization.split(' ')
        const jwtToken = split[1]

        const goalId = event.pathParameters.goalId
        const updatedGoal: UpdateGoalRequest = JSON.parse(event.body)

        const toDoItem = await updateGoal(updatedGoal, goalId, jwtToken)

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
                'Access-Control-Allow-Headers': 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',

            },
            body: JSON.stringify({
                item: toDoItem
            })
        }
    }
)

handler.use(cors());
