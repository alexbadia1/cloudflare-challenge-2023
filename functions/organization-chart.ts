import * as Papa from 'papaparse';

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

interface IOrganiationChartEmployee extends IBaseEmployee {
  skills: string[];
}

interface IOrganiationChartDepartment {
  name: string;
  managerName?: string;
  employees: IOrganiationChartEmployee[];
}

interface IOrganizationChart {
  organization: {
    departments: IOrganiationChartDepartment[];
  };
}

interface IOrganizationChartPostRequest {
  organizationData: string;
}

const KV_ORGANIZATION_DATA_KEY = "organizationData";

function parseOrganizationCsvData(csv: string): IRawOrganizationData {
  const rawOrgData: IRawOrganizationData = {
    organizationData: [] as IRawEmployee[],
  };
  Papa.parse(csv, {
    header: true,
    complete: function (results) {
      rawOrgData.organizationData = results.data as IRawEmployee[];
    },
    error: function (error) {
      return null;
    },
  });

  return rawOrgData;
}

function generateOrganizationChart(
  orgData: IRawEmployee[]
): IOrganizationChart {
  const organizationChart: IOrganizationChart = {
    organization: {
      departments: [] as IOrganiationChartDepartment[],
    },
  };

  const cache = new Map<string, IOrganiationChartDepartment>();

  orgData.forEach((employee: IRawEmployee) => {
    if (!cache.has(employee.department)) {
      // Department names are case-sensitive
      cache.set(employee.department, {
        name: employee.department,
        employees: [] as IOrganiationChartEmployee[],
      } as IOrganiationChartDepartment);
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
    } as IOrganiationChartEmployee);

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
  // If reads were no concern, each employee could be a key value entry. Doing so would lead to
  // many reads which isn't really scalable. Maybe KV isn't the best solution for this...
  const orgJson: IRawOrganizationData = JSON.parse(response);

  // Create organizational chart
  const organizationChart = generateOrganizationChart(orgJson.organizationData);

  // Respond with organization chart
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
  const organizationChart = generateOrganizationChart(orgJson.organizationData);

  // Respond with organization chart
  const headers = new Headers();
  headers.set("Content-Type", "application/json;charset=utf-8");
  return new Response(JSON.stringify(organizationChart), {
    status: 200,
    headers: headers,
  } as ResponseInit);
};
