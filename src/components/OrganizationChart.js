import React, { useEffect, useState } from "react";
import OrgChart from "@unicef/react-org-chart";


const OrganizationChart = () => {

  const [tree, setTree] = useState({});

  // Load organization chart data on initial render
  useEffect(() => {
    const getOrgChart = async () => {
      // const response = await fetch("/organization-chart");
      const response = await fetch("https://fee5dc9d.cloudflare-frontend-dw6.pages.dev/organization-chart");
      const newOrgChart = await response.json();
      setTree(newOrgChart);
      console.log(newOrgChart);
    };
    getOrgChart();
  }, []);

  return (
    <OrgChart
      tree={tree}
      // downloadImageId="download-image"
      // downloadPdfId="download-pdf"
      // onConfigChange={config => {
      //   // Setting latest config to state
      //   this.setState({ config: config })
      // }}
      // loadConfig={d => {
      //    // Called from d3 to get latest version of the config. 
      //   const config = this.handleLoadConfig(d)
      //   return config
      // }}
      // loadParent={personData => {
      //   // getParentData(): To get the parent data from API
      //   const loadedParent = this.getParentData(personData)
      //   return Promise.resolve(loadedParent)
      // }}
      // loadChildren={personData => {
      //   // getChildrenData(): To get the children data from API
      //   const loadedChildren = this.getChildrenData(personData)
      //   return Promise.resolve(loadedChildren)
      // }}
      // loadImage={personData => {
      //   // getImage(): To get the image from API
      //   const image = getImage(personData.email)
      //   return Promise.resolve(image)
      // }}
    />
  )
}

export default OrganizationChart;