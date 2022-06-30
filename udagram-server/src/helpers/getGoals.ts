import { GoalsAccess } from './goalsAcess'
import { GoalItem } from '../models/GoalItem'
import { GoalUpdate } from '../models/GoalUpdate'
import { CreateGoalRequest } from '../requests/CreateGoalRequest'
import { UpdateGoalRequest } from '../requests/UpdateGoalRequest'
import * as uuid from 'uuid'
import { getUserId } from '../lambda/utils'
import { parseUserId } from '../auth/utils'
import { APIGatewayProxyEvent } from 'aws-lambda'

const s3BucketName = process.env.S3_BUCKET_NAME
const goalsAccess = new GoalsAccess()

export async function getGoals(
  event: APIGatewayProxyEvent
): Promise<GoalItem[]> {
  const userId = getUserId(event)
  console.log(userId)
  return goalsAccess.getGoals(userId)
}

export function createGoal(
  createGoalRequest: CreateGoalRequest,
  jwtToken: string
): Promise<GoalItem> {
  const userId = parseUserId(jwtToken)
  console.log(userId)
  const goalId = uuid.v4()
  return goalsAccess.createGoal({
    userId,
    goalId,
    createdAt: new Date().getTime().toString(),
    done: false,
    attachmentUrl: `https://${s3BucketName}.s3.us-east-2.amazonaws.com/${goalId}`,
    ...createGoalRequest
  })
}

export function updateGoal(
  updateGoalRequest: UpdateGoalRequest,
  goalId: string,
  jwtToken: string
): Promise<GoalUpdate> {
  const userId = parseUserId(jwtToken)
  return goalsAccess.updateGoal(updateGoalRequest, goalId, userId)
}

export function deleteGoal(goalId: string, jwtToken: string): Promise<string> {
  const userId = parseUserId(jwtToken)
  return goalsAccess.deleteGoal(goalId, userId)
}

export function generateUploadUrl(goalId: string): Promise<string> {
  return goalsAccess.generateUploadUrl(goalId)
}
