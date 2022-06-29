import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createGoal, deleteGoal, getGoals, patchGoal } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Goal } from '../types/Goal'

interface GoalsProps {
  auth: Auth
  history: History
}

interface GoalsState {
  todos: Goal[]
  newGoalName: string
  loadingGoals: boolean
}

export class Goals extends React.PureComponent<GoalsProps, GoalsState> {
  state: GoalsState = {
    todos: [],
    newGoalName: '',
    loadingGoals: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newGoalName: event.target.value })
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onGoalCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newGoal = await createGoal(this.props.auth.getIdToken(), {
        name: this.state.newGoalName,
        dueDate
      })
      this.setState({
        todos: [...this.state.todos, newGoal],
        newGoalName: ''
      })
    } catch {
      alert('Goal creation failed')
    }
  }

  onGoalDelete = async (todoId: string) => {
    try {
      await deleteGoal(this.props.auth.getIdToken(), todoId)
      this.setState({
        todos: this.state.todos.filter((todo) => todo.todoId !== todoId)
      })
    } catch {
      alert('Goal deletion failed')
    }
  }

  onGoalCheck = async (pos: number) => {
    try {
      const todo = this.state.todos[pos]
      await patchGoal(this.props.auth.getIdToken(), todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      })
    } catch {
      alert('Goal deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const todos = await getGoals(this.props.auth.getIdToken())
      this.setState({
        todos,
        loadingGoals: false
      })
    } catch (e: any) {
      alert(`Failed to fetch todos: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">GOALs</Header>

        {this.renderCreateGoalInput()}

        {this.renderGoals()}
      </div>
    )
  }

  renderCreateGoalInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onGoalCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderGoals() {
    if (this.state.loadingGoals) {
      return this.renderLoading()
    }

    return this.renderGoalsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading GOALs
        </Loader>
      </Grid.Row>
    )
  }

  renderGoalsList() {
    return (
      <Grid padded>
        {this.state.todos.map((todo, pos) => {
          return (
            <Grid.Row key={todo.todoId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onGoalCheck(pos)}
                  checked={todo.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {todo.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(todo.todoId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onGoalDelete(todo.todoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {todo.attachmentUrl && (
                <Image src={todo.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
