interface Env {
  CLOUDFLARE_ORG: KVNamespace;
}

interface IRawEmployee {
  name: string;
  department: string;
  salary: number;
  office: string;
  isManager: boolean;
  ill1: string;
  skill2: string;
  skill3: string;
}

interface IRawOrganizationData {
  organizationData: IRawEmployee[];
}

interface IQuery {
  name: string;
  department: string;
  minSalary: number;
  maxSalary: number;
  office: string;
  skill: string;
}

interface IQueryResult {
  employees: IRawEmployee[]
}

const KV_ORGANIZATION_DATA_KEY = "organizationData";

function filterBy(employees: IRawEmployee[], query: IQuery): IQueryResult {
  const queryResult: IQueryResult = {
    employees: [] as IRawEmployee[]
  };

  employees.filter(
    (employee: IRawEmployee) => {}
  );

  return queryResult;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  // Get query from body
  const query = context.request.body;

  const headers = new Headers();
  return new Response(
    JSON.stringify(query), 
    {
    status: 200,
    headers: headers
    } as ResponseInit
  );

  // // Get organization data
  // const response = await context.env.CLOUDFLARE_ORG.get(
  //   KV_ORGANIZATION_DATA_KEY
  // );
  // const orgJson: IRawOrganizationData = JSON.parse(response);

  // // Apply query
  // const result: IQueryResult = filterBy(orgJson.organizationData, query);

  // // Return results
  // const headers = new Headers();
  // headers.set("Content-Type", "application/json;charset=utf-8");
  // return new Response(
  //   JSON.stringify(result), 
  //   {
  //   status: 200,
  //   headers: headers
  //   } as ResponseInit
  // );
};
