import React from "react";
import "./App.css";
import OrgChart from "@unicef/react-org-chart";
import { ThreeCircles } from "react-loader-spinner";
import avatarPersonnel from "./assets/avatar-personnel.svg";
import cloudflareIcon from "./assets/cloudflare-icon.svg";
import Toolbar from "./components/Toolbar/Toolbar";

export const ROOT_NODE = {
  id: -1,
  person: {
    id: -1,
    avatar: cloudflareIcon,
    department: "",
    name: "Cloudflare",
    title: "Organization",
    totalReports: 0,
  },
  hasChild: true,
  hasParent: false,
  children: [],
};

/**
 * Transform Organization Chart from API to React-Org-Chart Format.
 *
 * @param {*} data organiation chart
 * @returns root node
 */
function createTree(data) {
  let nodeId = 1;
  let totalEmployees = 0;

  // 1. Departments Subtree
  const departmentTrees = data.organization.departments.map((dep) => {
    totalEmployees += dep.employees.length;

    // 2. Find manager
    const managerIndex = dep.employees.findIndex((emp) => emp.isManager);
    const manager = {
      id: nodeId,
      person: {
        id: nodeId,
        avatar: avatarPersonnel,
        department: dep.employees[managerIndex].department,
        name: dep.employees[managerIndex].name,
        title: "Elite",
        totalReports: dep.employees.length - 1,
      },
      hasChild: true,
      hasParent: true,
      children: [],
    };

    // 3. Add employees as manager"s children (excluding the manager themself)
    dep.employees.splice(managerIndex, 1);
    manager.children = dep.employees.map((emp) => {
      nodeId++;
      return {
        id: nodeId,
        person: {
          id: nodeId,
          avatar: avatarPersonnel,
          department: emp.department,
          name: emp.name,
          title: "Grunt",
          totalReports: 0,
        },
        hasChild: false,
        hasParent: true,
        children: [],
      };
    });

    // 4. Add manager as child to department
    return {
      id: dep.name,
      person: {
        id: dep.name,
        avatar: avatarPersonnel,
        department: dep.name,
        name: dep.name,
        title: `Manager: ${dep.managerName}`,
        totalReports: dep.employees.length,
      },
      hasChild: true,
      hasParent: true,
      children: [manager],
    };
  });

  // 5. Add department to organization
  ROOT_NODE.person.totalReports = totalEmployees;
  ROOT_NODE.children = departmentTrees;

  return ROOT_NODE;
}

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tree: null,
      downloadingChart: false,
      config: {},
      highlightPostNumbers: [1],
    };
  }

  componentDidMount() {
    // Timeout for dramatic effect
    setTimeout(() => {
      fetch(
        "/organization-chart"
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          this.setState({ tree: createTree(data) });
        })
        .catch((error) => {
          this.setState({ error });
        });
    }, 1000);
  }

  handleDownload = () => {
    this.setState({ downloadingChart: false });
  };

  handleOnChangeConfig = (config) => {
    this.setState({ config: config });
  };

  handleLoadConfig = () => {
    const { config } = this.state;
    return config;
  };

  render() {
    const { tree, downloadingChart } = this.state;

    const downloadImageId = "download-image";
    const downloadPdfId = "download-pdf";

    if (tree === null) {
      return (
        <div className="loading">
          <ThreeCircles
            height="100"
            width="100"
            color="#4fa94d"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
            ariaLabel="three-circles-rotating"
            outerCircleColor=""
            innerCircleColor=""
            middleCircleColor=""
          />
        </div>
      );
    }

    return (
      <React.Fragment>
        <Toolbar />
        <div className="zoom-buttons">
          <button className="btn btn-outline-primary zoom-button" id="zoom-in">
            +
          </button>
          <button className="btn btn-outline-primary zoom-button" id="zoom-out">
            -
          </button>
        </div>
        <div className="download-buttons">
          <button className="btn btn-outline-primary" id="download-image">
            Download as image
          </button>
          <button className="btn btn-outline-primary" id="download-pdf">
            Download as PDF
          </button>
          <a
            className="github-link"
            href="https://github.com/alexbadia1/cloudflare-front-end"
          >
            GitHub
          </a>
          {downloadingChart && <div>Downloading chart</div>}
        </div>
        <OrgChart
          tree={tree}
          downloadImageId={downloadImageId}
          downloadPdfId={downloadPdfId}
          onConfigChange={(config) => {
            this.handleOnChangeConfig(config);
          }}
          loadConfig={(d) => {
            let configuration = this.handleLoadConfig(d);
            if (configuration) {
              return configuration;
            }
          }}
          downlowdedOrgChart={(d) => {
            this.handleDownload();
          }}
          loadImage={(d) => {
            return Promise.resolve(avatarPersonnel);
          }}
        />
      </React.Fragment>
    );
  }
}
