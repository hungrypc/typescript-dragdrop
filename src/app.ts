class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement
    this.hostElement = document.getElementById('app')! as HTMLDivElement

    const importedNode = document.importNode(this.templateElement.content, true)
    this.element = importedNode.firstElementChild as HTMLFormElement

    this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement

    this.configure()
    this.attach()
  }

  private handleSubmit = (event: Event) => {
    event.preventDefault()
    console.log(this.titleInputElement.value)
  }

  private configure() {
    this.element.addEventListener('submit', this.handleSubmit)
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element)
  }
}

const prjInput = new ProjectInput()