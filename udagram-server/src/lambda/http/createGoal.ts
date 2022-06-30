import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { CreateGoalRequest } from '../../requests/CreateGoalRequest'
import { createGoal } from '../../helpers/getGoals'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { GoalsAccess } from '../../helpers/goalsAcess'

const logger = createLogger('createGoal')
const goalsAccess = new GoalsAccess()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing Event ', event)
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    const newGoal: CreateGoalRequest = JSON.parse(event.body)
    const toDoItem = await createGoal(newGoal, jwtToken)
    const goalId = toDoItem.goalId
    const url = goalsAccess.generateUploadUrl(goalId)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: toDoItem,
        uploadUrl: url
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
