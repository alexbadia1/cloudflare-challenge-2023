interface Env {
  CLOUDFLARE_ORG: KVNamespace;
}

interface IRawEmployee {
  name: string;
  department: string;
  salary: number;
  office: string;
  isManager: boolean;
  skill1: string;
  skill2: string;
  skill3: string;
}

interface IRawOrganizationData {
  organizationData: IRawEmployee[];
}

interface IQuery {
  name?: string;
  department?: string;
  minSalary?: number;
  maxSalary?: number;
  office?: string;
  skill?: string;
}

interface IQueryResult {
  employees: IRawEmployee[];
}

// Worker-Page KV key for organization data
const KV_ORGANIZATION_DATA_KEY = "organizationData";

/**
 * Filters a list of employees based on the provided query {@link IQuery}.
 *
 * @param {IRawEmployee[]} employees - list of employees to query
 * @param {IQuery} query - query with rgex criteria
 * @returns {IRawEmployee[]} - list of employees that match query
 */
function filterBy(employees: IRawEmployee[], query: IQuery): IRawEmployee[] {
  return employees.filter((employee: IRawEmployee) => {
    if (query?.name && employee.name.match(query.name) === null) {
      return false;
    }

    if (
      query?.department &&
      employee.department.match(query.department) === null
    ) {
      return false;
    }

    if (query?.minSalary && employee.salary < query.minSalary) {
      return false;
    }

    if (query?.maxSalary && employee.salary > query.maxSalary) {
      return false;
    }

    if (query?.office && employee.office.match(query.office) === null) {
      return false;
    }

    if (
      query?.skill &&
      employee.skill1.match(query.skill) === null &&
      employee.skill2.match(query.skill) === null &&
      employee.skill3.match(query.skill) === null
    ) {
      return false;
    }

    // Must match ALL fields present in query
    return true;
  });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const query: IQuery = await context.request.json();

  // Entire organization data is stored as one key value pair to avoid limits during AutoGrade.
  //
  // If there were no read limit, each employee could be a key value entry. However, queries would
  // be super inefficient. There must be an elasti-cache equivalent product by Cloudflare?
  const data = await context.env.CLOUDFLARE_ORG.get(KV_ORGANIZATION_DATA_KEY);
  const orgJson: IRawOrganizationData = JSON.parse(data);
  const result: IRawEmployee[] = filterBy(orgJson.organizationData, query);

  const response: IQueryResult = {
    employees: result,
  };

  const headers = new Headers();
  headers.set("Content-Type", "application/json;charset=utf-8");
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: headers,
  } as ResponseInit);
};
