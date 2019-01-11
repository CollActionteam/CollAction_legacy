import * as React from "react";
import FindProject from "./FindProject";

import "./styles/FindProject.scss";
import "./styles/ProjectDetails.scss";
import "./styles/StartInfo.scss";
import "./styles/SimpleProjectCreate.scss";
import "./styles/ProjectCreate.scss";
import "./styles/ProjectCommit.scss";
import "./styles/ProjectThankYouCommit.scss";
import "./styles/ProjectSendEmail.scss";

import "./PieChart";
import "./Carousel";

import "./UploadBanner";
import "./UploadDescriptiveImage";

import  "./ProjectPreview";

import renderComponentIf from "../global/renderComponentIf";

renderComponentIf(
  <FindProject controller={true} />,
  document.getElementById("project-controller")
);

renderComponentIf(
  <FindProject controller={false} />,
  document.getElementById("projects-container")
);