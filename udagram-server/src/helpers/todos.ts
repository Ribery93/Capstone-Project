import { GoalsAccess } from './todosAcess'
import { GoalItem } from '../models/GoalItem'
import { GoalUpdate } from '../models/GoalUpdate'
import { CreateGoalRequest } from '../requests/CreateGoalRequest'
import { UpdateGoalRequest } from '../requests/UpdateGoalRequest'
import * as uuid from 'uuid'
import { getUserId } from '../lambda/utils'
import { parseUserId } from '../auth/utils'
import { APIGatewayProxyEvent } from 'aws-lambda'

const s3BucketName = process.env.S3_BUCKET_NAME
const todosAccess = new GoalsAccess()

// export async function getGoals(jwtToken: string): Promise<GoalItem[]> {
//   const userId = parseUserId(jwtToken)
//   return todosAccess.getGoals(userId)
// }

export async function getGoals(
  event: APIGatewayProxyEvent
): Promise<GoalItem[]> {
  const userId = getUserId(event)
  console.log(userId)
  return todosAccess.getGoals(userId)
}

export function createGoal(
  createGoalRequest: CreateGoalRequest,
  jwtToken: string
): Promise<GoalItem> {
  const userId = parseUserId(jwtToken)
  console.log(userId)
  const todoId = uuid.v4()
  return todosAccess.createGoal({
    userId,
    todoId,
    createdAt: new Date().getTime().toString(),
    done: false,
    attachmentUrl: `https://${s3BucketName}.s3.us-east-2.amazonaws.com/${todoId}`,
    ...createGoalRequest
  })
}

export function updateGoal(
  updateGoalRequest: UpdateGoalRequest,
  todoId: string,
  jwtToken: string
): Promise<GoalUpdate> {
  const userId = parseUserId(jwtToken)
  return todosAccess.updateGoal(updateGoalRequest, todoId, userId)
}

export function deleteGoal(todoId: string, jwtToken: string): Promise<string> {
  const userId = parseUserId(jwtToken)
  return todosAccess.deleteGoal(todoId, userId)
}

export function generateUploadUrl(todoId: string): Promise<string> {
  return todosAccess.generateUploadUrl(todoId)
}
