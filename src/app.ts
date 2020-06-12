// Project Type
enum ProjectStatus { Active, Finished }

class Project {
  constructor(
    public id: string, 
    public title: string, 
    public description: string, 
    public people: number,
    public status: ProjectStatus
  ) {

  }
}

// Project State Management
type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];  // whenever something changes, we call whats in here

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn)
  }
}

class ProjectState extends State<Project> {
  
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super()
  }

  static getInstance() {
    if (this.instance) {
      return this.instance
    }
    this.instance = new ProjectState()
    return this.instance
  }

  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      ProjectStatus.Active
    )

    this.projects.push(newProject)
    for (const listenerFn of this.listeners){
      listenerFn(this.projects.slice())   // .slice to use copy of arr
    }
  }
}

// global instance of project state
const projectState = ProjectState.getInstance()
// ensures that we only work with ONE ProjectState instance

// validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0
  }
  if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length >= validatableInput.minLength
  }
  if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length <= validatableInput.maxLength
  }
  if (validatableInput.min != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value >= validatableInput.min
  }
  if (validatableInput.max != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value <= validatableInput.max
  }

  return isValid
}

// autobind decorator
function autobind(
  _: any, 
  _2: string, 
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this)
      return boundFn
    }
  }
  return adjDescriptor
}

// Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string, 
    hostElementId: string, 
    insertAtStart: boolean, 
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement
    this.hostElement = document.getElementById(hostElementId)! as T

    const importedNode = document.importNode(this.templateElement.content, true)
    this.element = importedNode.firstElementChild as U
    if (newElementId) {
      this.element.id = newElementId
    }

    this.attach(insertAtStart)
  }

  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element)
  }

  abstract configure(): void

  abstract renderContent(): void
}

// ProjectList Class
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'projects-container', true, `${type}-projects`)
    this.assignedProjects = []

    projectState.addListener((projects: Project[]) => {
      const filteredProjects = projects.filter(prj => {
        if (this.type === 'active') {
          return prj.status === ProjectStatus.Active
        }
        return prj.status === ProjectStatus.Finished
      })
      this.assignedProjects = filteredProjects
      this.renderProjects()
    })

    this.configure()
    this.renderContent()
  }

  configure() {}

  renderContent() {
    const listId = `${this.type}-projects-list`
    this.element.querySelector('ul')!.id = listId
    const header = this.element.querySelector('h2')!
    header.textContent = this.type.toUpperCase() + ' PROJECTS'
    header.classList.add(this.type === "active" ? "green" : "red")

  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement
    listEl.innerHTML = ''
    for (const project of this.assignedProjects) {
      const listItem = document.createElement('li')
      listItem.textContent = project.title
      listEl.appendChild(listItem)
    }
  }
}


// ProjectInput Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

  private gatherUserInput(): [string, string, number] | void  {
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
  private handleSubmit (event: Event) {
    event.preventDefault()
    const userInput = this.gatherUserInput()
    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput
      projectState.addProject(title, description, people)
      this.clearInputs()
    }
  }

  renderContent() {}

  configure() {    
    this.element.addEventListener('submit', this.handleSubmit)
  }
}

const prjInput = new ProjectInput()
const finishedPrjList = new ProjectList('finished')
const activePrjList = new ProjectList('active')