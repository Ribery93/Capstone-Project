/**
 * Fields in a request to update a single GOAL item.
 */
export interface UpdateGoalRequest {
  name: string
  dueDate: string
  done: boolean
}