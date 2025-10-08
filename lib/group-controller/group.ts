import axios from "axios";

export type ApiGroup = {
  idGroup: string;
  name: string;
  owner: string;
};

const GROUPS_URL = "https://labtec.satc.edu.br/dev/base-api/groups";

export async function fetchGroupsAxios(token?: string | null): Promise<ApiGroup[]> {
  const res = await axios.get<ApiGroup[]>(GROUPS_URL, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
}

export async function membersGroup(idGroup: string, token?: string | null) {
  const res = await axios.get(`${GROUPS_URL}/${idGroup}/members`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
}

export async function renameGroup(idGroup: string, newName: string, token?: string | null) {
  const res = await axios.patch(`${GROUPS_URL}/${idGroup}`, {
    name: newName
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

export default fetchGroupsAxios;