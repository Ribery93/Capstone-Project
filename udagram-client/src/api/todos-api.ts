import { apiEndpoint } from '../config'
import { Goal } from '../types/Goal';
import { CreateGoalRequest } from '../types/CreateGoalRequest';
import Axios from 'axios'
import { UpdateGoalRequest } from '../types/UpdateGoalRequest';

export async function getGoals(idToken: string): Promise<Goal[]> {
  console.log('Fetching todos')

  const response = await Axios.get(`${apiEndpoint}/todos`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Goals:', response.data)
  return response.data.items
}

export async function createGoal(
  idToken: string,
  newGoal: CreateGoalRequest
): Promise<Goal> {
  const response = await Axios.post(`${apiEndpoint}/todos`,  JSON.stringify(newGoal), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchGoal(
  idToken: string,
  todoId: string,
  updatedGoal: UpdateGoalRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/todos/${todoId}`, JSON.stringify(updatedGoal), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteGoal(
  idToken: string,
  todoId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/todos/${todoId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  todoId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/todos/${todoId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
