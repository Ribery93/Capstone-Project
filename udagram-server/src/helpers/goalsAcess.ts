import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { GoalItem } from '../models/GoalItem'
import { GoalUpdate } from '../models/GoalUpdate'
import { Types } from 'aws-sdk/clients/s3'

const XAWS = AWSXRay.captureAWS(AWS)

export class GoalsAccess {
  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly s3Client: Types = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly goalsTable = process.env.GOALS_TABLE,
    private readonly s3BucketName = process.env.S3_BUCKET_NAME
  ) {}

  async getGoals(userId: string): Promise<GoalItem[]> {
    console.log('Get all goals of logged in user')
    const params = {
      TableName: this.goalsTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }
    const result = await this.docClient.query(params).promise()
    console.log(result)
    const items = result.Items
    return items as GoalItem[]
  }

  async createGoal(goalItem: GoalItem): Promise<GoalItem> {
    const params = {
      TableName: this.goalsTable,
      Item: goalItem
    }

    const result = await this.docClient.put(params).promise()
    console.log(result)

    return goalItem as GoalItem
  }

  async updateGoal(
    goalUpdate: GoalUpdate,
    goalId: string,
    userId: string
  ): Promise<GoalUpdate> {
    console.log('Updating goal')

    const params = {
      TableName: this.goalsTable,
      Key: {
        userId: userId,
        goalId: goalId
      },
      UpdateExpression: 'set #a = :a, #b = :b, #c = :c',
      ExpressionAttributeNames: {
        '#a': 'name',
        '#b': 'dueDate',
        '#c': 'done'
      },
      ExpressionAttributeValues: {
        ':a': goalUpdate['name'],
        ':b': goalUpdate['dueDate'],
        ':c': goalUpdate['done']
      },
      ReturnValues: 'ALL_NEW'
    }

    const result = await this.docClient.update(params).promise()
    console.log(result)
    const attributes = result.Attributes

    return attributes as GoalUpdate
  }

  async deleteGoal(goalId: string, userId: string): Promise<string> {
    console.log('Deleting goal')

    const params = {
      TableName: this.goalsTable,
      Key: {
        userId: userId,
        goalId: goalId
      }
    }

    const result = await this.docClient.delete(params).promise()
    console.log(result)

    return '' as string
  }

  async generateUploadUrl(goalId: string): Promise<string> {
    console.log('Generating URL')

    const url = this.s3Client.getSignedUrl('putObject', {
      Bucket: this.s3BucketName,
      Key: goalId,
      Expires: 3000
    })
    console.log(url)

    return url as string
  }
}
