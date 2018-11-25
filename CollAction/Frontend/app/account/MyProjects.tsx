import * as React from "react";
import ProjectList, { IProject } from "../project/ProjectList";
import renderComponentIf from "../global/renderComponentIf";

interface IMyProjectsProps {
}

interface IMyProjectsState {
  projectList: IProject[];
  projectFetching: boolean;
  projectFetchError: any;
}

export default class MyProjects extends React.Component<IMyProjectsProps, IMyProjectsState> {
  constructor (props) {
    super(props);
    const projectList = [];

    this.state = {
      projectList,
      projectFetching: false,
      projectFetchError: null,
    };
  }

  componentDidMount() {
    this.fetchProjects();
  }

  async fetchProjects() {
    this.setState({ projectFetching: true });

    const getUrl: () => string = () => {
      return "/api/manage/myprojects";
    };

    try {
      const searchProjectRequest: Request = new Request(getUrl());
      const fetchResult: Response = await fetch(searchProjectRequest);
      const jsonResponse = await fetchResult.json();
      this.setState({ projectFetching: false, projectList: jsonResponse });
    } catch (e) {
      this.setState({ projectFetching: false, projectFetchError: e });
    }
  }

  render () {
    return (
    <ProjectList projectList={this.state.projectList} />
    );
  }
}

renderComponentIf(
    <MyProjects></MyProjects>,
    document.getElementById("my-projects")
);