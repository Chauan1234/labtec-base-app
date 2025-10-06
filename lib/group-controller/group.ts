import axios from "axios";

export type ApiGroup = {
  idGroup: string;
  name: string;
  owner: string;
};

const GROUPS_URL = "https://labtec.satc.edu.br/dev/base-api/groups";

export async function fetchGroupsAxios(token?: string | null) {
  const res = await axios.get(GROUPS_URL, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
}

export default fetchGroupsAxios;