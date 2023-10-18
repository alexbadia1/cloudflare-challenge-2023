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
function parseCsvData(csv: string): IRawOrganizationData {
  const rawOrgData: IRawOrganizationData = {
    organizationData: [] as IRawEmployee[],
  };

  // Assume row delimitters are "\n" and remove last \n.
  const rows = csv.trimEnd().split("\n");

  // Skip headers
  rows.shift();

  rawOrgData.organizationData = rows.map((r) => {
    // Assume csv uses comma-separated delimitters.
    const cols = r.split(",");

    // Assume that the csv formatted containing only boolean, integer, and string values.
    return {
      name: cols[0],
      department: cols[1],
      salary: parseInt(cols[2], 10),
      office: cols[3],
      isManager: JSON.parse(cols[4].toLowerCase()),
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
 * @param {IRawEmployee[]} employees - list of employees
 * @returns {IOrganizationChart} - Organization Chart
 */
function createOrgChart(employees: IRawEmployee[]): IOrganizationChart {
  const organizationChart: IOrganizationChart = {
    organization: {
      departments: [] as IOrganizationChartDepartment[],
    },
  };

  // Keep track of unique departments
  const cache = new Map<string, IOrganizationChartDepartment>();

  // Sort employee's by department
  employees.forEach((employee: IRawEmployee) => {
    // Department names are case-sensitive
    if (!cache.has(employee.department)) {
      cache.set(employee.department, {
        name: employee.department,
        employees: [] as IOrganizationChartEmployee[],
      } as IOrganizationChartDepartment);
    }

    const currentDepartment = cache.get(employee.department);

    // Add employee to their respective department
    currentDepartment.employees.push({
      name: employee.name,
      department: employee.department,
      salary: employee.salary,
      office: employee.office,
      isManager: employee.isManager,
      // Convert skills to an array for organization chart
      skills: [employee.skill1, employee.skill2, employee.skill3],
    } as IOrganizationChartEmployee);

    // Assumes only 1 manager per department
    if (employee.isManager) {
      currentDepartment.managerName = employee.name;
    }
  });

  cache.forEach((departmentObj, _) => {
    organizationChart.organization.departments.push(departmentObj);
  });

  return organizationChart;
}

/**
 * When the frontend queries the /organization-chart endpoint, it should
 * receive a JSON response with a graph representation of the organization.
 *
 * The response you receive should be in this format
 * (see {@link IOrganizationChart}):
 *   {
 *     "organization" : {
 *       "departments": [<Department>, <Department>]
 *     }
 *   }
 *
 * Departments is a list of Department objects in this form
 * (see {@link IOrganizationChartDepartment}):
 *   {
 *     "name" : <string>,
 *     "managerName", <string>,
 *     "employees": [<Employee>, <Employee>]
 *   }
 *
 * And Employees is a list of Employee objects in this form
 * (see {@link IOrganizationChartEmployee}):
 *   {
 *     "name" : <string>,
 *     "department": <string>,
 *     "salary": <int>,
 *     "office": <string>,
 *     "isManager": <boolean>,
 *     "skills": [<string>, <string>, ...]
 *   }
 *
 * Note: To minimize risk of API limit throttling, the organization data is
 *       stored as 1 key-value pair in the Workers KV Namespace.
 *
 *       If there were no read limit, each employee could be a key-value entry
 *       in the Workers KV Namespace. This would make writes and deletes very
 *       simple. However, every time an organization chart is generated, or an
 *       employee is queried for, there would be many reads.
 *
 *       In terms of scalability, I don't think the Workers KV Namespace is
 *       the best implementation for the organization chart feature. Perhaps
 *       Cloudflare offers an elasticache like product which might be overkill.
 *
 * @param {EventContext} context
 * @returns {Response} Organization Chart
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const response = await context.env.CLOUDFLARE_ORG.get(
    KV_ORGANIZATION_DATA_KEY
  );

  const orgJson: IRawOrganizationData = JSON.parse(response);
  const orgChart: IOrganizationChart = createOrgChart(orgJson.organizationData);

  const headers = new Headers();
  headers.set("Content-Type", "application/json;charset=utf-8");
  headers.set('Access-Control-Allow-Origin', '*');
  return new Response(JSON.stringify(orgChart), {
    status: 200,
    headers: headers,
  } as ResponseInit);
};

/**
 * When the autograder posts data to the /organization-chart endpoint, it
 * should receive a JSON response with a graph representation of the
 * organization.
 *
 * The request's format is assumed to be:
 *    {
 *      "organizationData": <string representation of a csv>
 *    }
 *
 * For example, the following Request payload:
 *   {
 *     "organizationData": "name,department,salary,office,isManager,skill1,
 *       skill2,skill3\nJill,Developer Platform,100,Austin,FALSE,Typescript,
 *       C++,GoLang\nBelen Norman,Developer Platform,252,London,TRUE,HTML,
 *       Rust,GoLang\n"
 *   }
 *
 * Yields the following Response payload:
 *
 * {
 *   "organization": {
 *     "departments": [
 *       {
 *         "name": "Developer Platform",
 *         "managerName": "Belen Norman",
 *         "employees": [
 *           {
 *             "name": "Jill",
 *             "department": "Developer Platform",
 *             "salary": 100,
 *             "office": "Austin",
 *             "isManager": false,
 *             "skills": [
 *               "Typescript",
 *               "C++",
 *               "GoLang"
 *             ]
 *           },
 *           {
 *             "name": "Belen Norman",
 *             "department": "Developer Platform",
 *             "salary": 252,
 *             "office": "London",
 *             "isManager": true,
 *             "skills": [
 *               "HTML",
 *               "Rust",
 *               "GoLang"
 *             ]
 *           }
 *         ],
 *       },
 *     ]
 *   }
 * }
 *
 * @param {EventContext} context
 * @returns {Response} Organization Chart
 */
export const onRequestPost: PagesFunction = async (context) => {
  const request: IOrganizationChartPostRequest = await context.request.json();

  const orgJson: IRawOrganizationData = parseCsvData(request.organizationData);
  const orgChart: IOrganizationChart = createOrgChart(orgJson.organizationData);

  const headers = new Headers();
  headers.set("Content-Type", "application/json;charset=utf-8");
  headers.set('Access-Control-Allow-Origin', '*');
  return new Response(JSON.stringify(orgChart), {
    status: 200,
    headers: headers,
  } as ResponseInit);
};
