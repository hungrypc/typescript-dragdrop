import { Component } from '../components/base-component'
import { autobind } from '../decorators/autobind'
import { projectState } from '../state/project-state'
import { Project, ProjectStatus } from '../models/project'
import { DragTarget } from '../models/dragdrop'
import { ProjectItem } from './project-item'

// Project List Class
export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'projects-container', true, `${type}-projects`)
    this.assignedProjects = []

    this.configure()
    this.renderContent()
  }

  @autobind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault() // default doesn't allow drop, we have to tell it we want to allow it
      const listEl = this.element.querySelector('ul')!
      listEl.classList.add('droppable')
    }
  }

  @autobind
  dropHandler(event: DragEvent) {
    const projectId = event.dataTransfer!.getData('text/plain')
    projectState.moveProject(projectId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished)
    const listEl = this.element.querySelector('ul')!
    listEl.classList.remove('droppable')
  }

  @autobind
  dragLeaveHandler(_: DragEvent) {
    const listEl = this.element.querySelector('ul')!
    listEl.classList.remove('droppable')
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler)
    this.element.addEventListener('dragleave', this.dragLeaveHandler)
    this.element.addEventListener('drop', this.dropHandler)

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
  }

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
      console.log(project)
      new ProjectItem(this.element.querySelector('ul')!.id, project)
    }
  }
}
