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

import { createGoal, deleteGoal, getGoals, patchGoal } from '../api/goals-api'
import Auth from '../auth/Auth'
import { Goal } from '../types/Goal'

interface GoalsProps {
  auth: Auth
  history: History
}

interface GoalsState {
  goals: Goal[]
  newGoalName: string
  loadingGoals: boolean
}

export class Goals extends React.PureComponent<GoalsProps, GoalsState> {
  state: GoalsState = {
    goals: [],
    newGoalName: '',
    loadingGoals: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newGoalName: event.target.value })
  }

  onEditButtonClick = (goalId: string) => {
    this.props.history.push(`/goals/${goalId}/edit`)
  }

  onGoalCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newGoal = await createGoal(this.props.auth.getIdToken(), {
        name: this.state.newGoalName,
        dueDate
      })
      this.setState({
        goals: [...this.state.goals, newGoal],
        newGoalName: ''
      })
    } catch {
      alert('Goal creation failed')
    }
  }

  onGoalDelete = async (goalId: string) => {
    try {
      await deleteGoal(this.props.auth.getIdToken(), goalId)
      this.setState({
        goals: this.state.goals.filter((goal) => goal.goalId !== goalId)
      })
    } catch {
      alert('Goal deletion failed')
    }
  }

  onGoalCheck = async (pos: number) => {
    try {
      const goal = this.state.goals[pos]
      await patchGoal(this.props.auth.getIdToken(), goal.goalId, {
        name: goal.name,
        dueDate: goal.dueDate,
        done: !goal.done
      })
      this.setState({
        goals: update(this.state.goals, {
          [pos]: { done: { $set: !goal.done } }
        })
      })
    } catch {
      alert('Goal deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const goals = await getGoals(this.props.auth.getIdToken())
      this.setState({
        goals,
        loadingGoals: false
      })
    } catch (e: any) {
      alert(`Failed to fetch goals: ${e.message}`)
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
        {this.state.goals.map((goal, pos) => {
          return (
            <Grid.Row key={goal.goalId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onGoalCheck(pos)}
                  checked={goal.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {goal.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {goal.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(goal.goalId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onGoalDelete(goal.goalId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {goal.attachmentUrl && (
                <Image src={goal.attachmentUrl} size="small" wrapped />
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
