export interface GoalItem {
  userId: string
  goalId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
