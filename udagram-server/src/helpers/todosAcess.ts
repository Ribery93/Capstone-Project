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
    private readonly todosTable = process.env.GOALS_TABLE,
    private readonly s3BucketName = process.env.S3_BUCKET_NAME
  ) {}

  async getGoals(userId: string): Promise<GoalItem[]> {
    console.log('Get all todos of logged in user')
    const params = {
      TableName: this.todosTable,
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

  async createGoal(todoItem: GoalItem): Promise<GoalItem> {
    const params = {
      TableName: this.todosTable,
      Item: todoItem
    }

    const result = await this.docClient.put(params).promise()
    console.log(result)

    return todoItem as GoalItem
  }

  async updateGoal(
    todoUpdate: GoalUpdate,
    todoId: string,
    userId: string
  ): Promise<GoalUpdate> {
    console.log('Updating todo')

    const params = {
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: 'set #a = :a, #b = :b, #c = :c',
      ExpressionAttributeNames: {
        '#a': 'name',
        '#b': 'dueDate',
        '#c': 'done'
      },
      ExpressionAttributeValues: {
        ':a': todoUpdate['name'],
        ':b': todoUpdate['dueDate'],
        ':c': todoUpdate['done']
      },
      ReturnValues: 'ALL_NEW'
    }

    const result = await this.docClient.update(params).promise()
    console.log(result)
    const attributes = result.Attributes

    return attributes as GoalUpdate
  }

  async deleteGoal(todoId: string, userId: string): Promise<string> {
    console.log('Deleting todo')

    const params = {
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    }

    const result = await this.docClient.delete(params).promise()
    console.log(result)

    return '' as string
  }

  async generateUploadUrl(todoId: string): Promise<string> {
    console.log('Generating URL')

    const url = this.s3Client.getSignedUrl('putObject', {
      Bucket: this.s3BucketName,
      Key: todoId,
      Expires: 3000
    })
    console.log(url)

    return url as string
  }
}
