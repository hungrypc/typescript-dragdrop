import { Component } from '../components/base-component.js'
import { autobind } from '../decorators/autobind.js'
import { Validatable, validate } from '../utils/validation.js' 
import { projectState } from '../state/project-state.js'

// ProjectInput Class
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input')
    this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement

    this.configure()
  }

  private gatherUserInput(): [string, string, number] | void {
    const title = this.titleInputElement.value
    const description = this.descriptionInputElement.value
    const people = this.peopleInputElement.value

    const titleValidatable: Validatable = {
      value: title,
      required: true,
      minLength: 2,
      maxLength: 30
    }
    const descriptionValidatable: Validatable = {
      value: description,
      required: true,
      minLength: 5
    }
    const peopleValidatable: Validatable = {
      value: people,
      required: true,
      min: 1
    }

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert('Please enter valid inputs')
      return
    } else {
      return [title, description, +people]
    }
  }

  private clearInputs() {
    this.titleInputElement.value = ''
    this.descriptionInputElement.value = ''
    this.peopleInputElement.value = ''
  }

  @autobind
  private handleSubmit(event: Event) {
    event.preventDefault()
    const userInput = this.gatherUserInput()
    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput
      projectState.addProject(title, description, people)
      this.clearInputs()
    }
  }

  renderContent() { }

  configure() {
    this.element.addEventListener('submit', this.handleSubmit)
  }
}
