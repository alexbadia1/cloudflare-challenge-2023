interface Env {
  CLOUDFLARE_ORG: KVNamespace;
}

interface IBaseEmployee {
  name: string;
  department: string;
  salary: number;
  office: string;
  isManager: boolean;
}

interface IRawEmployee extends IBaseEmployee {
  skill1: string;
  skill2: string;
  skill3: string;
}

interface IRawOrganizationData {
  organizationData: IRawEmployee[];
}

interface IOrganizationChartEmployee extends IBaseEmployee {
  skills: string[];
}

interface IOrganizationChartDepartment {
  name: string;
  managerName?: string;
  employees: IOrganizationChartEmployee[];
}

interface IOrganizationChart {
  organization: {
    departments: IOrganizationChartDepartment[];
  };
}

interface IOrganizationChartPostRequest {
  organizationData: string;
}

// Worker-Page KV key for organization data
const KV_ORGANIZATION_DATA_KEY = "organizationData";

/**
 * Parses a CSV string containing organization data and returns it in a structured format.
 *
 * Note: Papaparse has a naming collision with workers-types, specifically, the Request object.
 *       Without a robust csv parsing library, assumptions about delimiters and csv format are made.
 *
 * @param {string} csv - The CSV contents to be parsed
 * @returns {IRawOrganizationData} - The parsed organization data
 */
function parseOrganizationCsvData(csv: string): IRawOrganizationData {
  const rawOrgData: IRawOrganizationData = {
    organizationData: [] as IRawEmployee[],
  };

  // Assume row delimitters are "\n"
  const rows = csv.split("\n");

  // Skip headers
  rows.shift();

  rawOrgData.organizationData = rows.map((r) => {
    // Assume csv uses comma-separated delimitters.=
    const cols = r.split(",");

    // Assume that the csv formatted containing only boolean, integer, and string values.=
    return {
      name: cols[0],
      department: cols[1],
      salary: parseInt(cols[2], 10),
      office: cols[3],
      isManager: JSON.parse(cols[4]),
      skill1: cols[5],
      skill2: cols[6],
      skill3: cols[7],
    } as IRawEmployee;
  });

  return rawOrgData;
}

/**
 * Creates an organization chart from a list of employees.
 *
 * @param {string} data - list of employees
 * @returns {IOrganizationChart} - organization chart
 */
function createOrgChart(data: IRawEmployee[]): IOrganizationChart {
  const organizationChart: IOrganizationChart = {
    organization: {
      departments: [] as IOrganizationChartDepartment[],
    },
  };

  const cache = new Map<string, IOrganizationChartDepartment>();
  data.forEach((employee: IRawEmployee) => {
    if (!cache.has(employee.department)) {
      // Department names are case-sensitive
      cache.set(employee.department, {
        name: employee.department,
        employees: [] as IOrganizationChartEmployee[],
      } as IOrganizationChartDepartment);
    }

    const currentDepartment = cache.get(employee.department);

    // Convert skills to an array for organization chart
    currentDepartment.employees.push({
      name: employee.name,
      department: employee.department,
      salary: employee.salary,
      office: employee.office,
      isManager: employee.isManager,
      skills: [employee.skill1, employee.skill2, employee.skill3],
    } as IOrganizationChartEmployee);

    if (employee.isManager) {
      // Assume there is only 1 manager per department
      currentDepartment.managerName = employee.name;
    }
  });

  cache.forEach((departmentObj, _) => {
    organizationChart.organization.departments.push(departmentObj);
  });

  return organizationChart;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const response = await context.env.CLOUDFLARE_ORG.get(
    KV_ORGANIZATION_DATA_KEY
  );

  // Entire organization data is stored as one key value pair to avoid limits during AutoGrade.
  //
  // If there were no read limit, each employee could be a key value entry. However, doing so would
  // lead to many reads each time an organization chart is generated or queried making scalability a concern.
  // Perhaps a key-value store isn't the best solution for this.
  const orgJson: IRawOrganizationData = JSON.parse(response);
  const organizationChart = createOrgChart(orgJson.organizationData);

  const headers = new Headers();
  headers.set("Content-Type", "application/json;charset=utf-8");
  return new Response(JSON.stringify(organizationChart), {
    status: 200,
    headers: headers,
  } as ResponseInit);
};

export const onRequestPost: PagesFunction = async (context) => {
  const request: IOrganizationChartPostRequest = await context.request.json();
  const orgJson: IRawOrganizationData = parseOrganizationCsvData(
    request.organizationData
  );
  const organizationChart = createOrgChart(orgJson.organizationData);

  // Respond with organization chart
  const headers = new Headers();
  headers.set("Content-Type", "application/json;charset=utf-8");
  return new Response(JSON.stringify(organizationChart), {
    status: 200,
    headers: headers,
  } as ResponseInit);
};
