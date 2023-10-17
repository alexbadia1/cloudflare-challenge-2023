import * as _ from "lodash";

interface Env {
  CLOUDFLARE_ORG: KVNamespace;
}

interface Employee {
  name: string;
  department: string;
  salary: number;
  office: string;
  isManager: boolean;
  skill1: string;
  skill2: string;
  skill3: string;
}

interface OrganizationData {
  organizationData: Employee[];
}

const KV_ORGANIZATION_DATA_KEY = "organizationData";

export const onRequest: PagesFunction<Env> = async (context) => {
  const response = await context.env.CLOUDFLARE_ORG.get(
    KV_ORGANIZATION_DATA_KEY
  );
  const orgJson: OrganizationData = JSON.parse(response);
  const orgData: Employee[] = orgJson.organizationData;
  const orderedOrgData = _.orderBy(orgData, ["department", "isManager"], ["asc", "desc"]);

  const headers = new Headers();
  headers.set("Content-Type", "application/json;charset=utf-8");
  return new Response(
    JSON.stringify({
      sortedOrganizationData: orderedOrgData,
    }),
    {
      status: 200,
      headers: headers,
    } as ResponseInit
  );
};
